import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

const getDaysDifference = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const createBookingService = async (customerId: number, data: any) => {
  const { vehicle_id, rent_start_date, rent_end_date } = data;

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate <= startDate) {
    const err: any = new Error('rent_end_date must be after rent_start_date.');
    err.statusCode = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx: any) => {
    const vehicle = await tx.vehicles.findUnique({
      where: { id: vehicle_id },
    });

    if (!vehicle || vehicle.availability_status !== 'available') {
      throw new Error('Vehicle is not available.');
    }

    const days = getDaysDifference(startDate, endDate);
    const totalPrice = days * Number(vehicle.daily_rent_price);

    const booking = await tx.bookings.create({
      data: {
        customer_id: customerId,
        vehicle_id,
        rent_start_date: startDate,
        rent_end_date: endDate,
        total_price: totalPrice,
        status: 'active',
      },
    });

    await tx.vehicles.update({
      where: { id: vehicle_id },
      data: { availability_status: 'booked' },
    });

    return booking;
  });
};

export const getAllBookingsService = async (requesterId: number, requesterRole: string, query: any) => {
  const { page = 1, limit = 10, status, customer_id, vehicle_id } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.bookingsWhereInput = {};

  if (requesterRole === 'customer') {
    where.customer_id = requesterId;
  } else {
    if (customer_id) where.customer_id = Number(customer_id);
  }

  if (status) where.status = status;
  if (vehicle_id) where.vehicle_id = Number(vehicle_id);

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      include: {
        users: { select: { name: true, email: true } },
        vehicles: { 
          select: { 
            vehicle_name: true, 
            registration_number: true,
            vehicle_images: {
              where: { is_primary: true },
              take: 1
            }
          } 
        },
      },
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.bookings.count({ where }),
  ]);

  return {
    bookings,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getBookingByIdService = async (id: number, requesterId: number, requesterRole: string) => {
  const booking = await prisma.bookings.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, phone: true } },
      vehicles: { 
        select: { 
          id: true, 
          vehicle_name: true, 
          type: true, 
          registration_number: true,
          vehicle_images: {
            where: { is_primary: true },
            take: 1
          }
        } 
      },
    },
  });

  if (!booking) {
    const err: any = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }

  if (requesterRole === 'customer' && booking.customer_id !== requesterId) {
    const err: any = new Error('Forbidden.');
    err.statusCode = 403;
    throw err;
  }

  return booking;
};

export const updateBookingService = async (id: number, requesterId: number, requesterRole: string) => {
  return await prisma.$transaction(async (tx: any) => {
    const booking = await tx.bookings.findUnique({ where: { id } });

    if (!booking || booking.status !== 'active') {
      throw new Error('Booking not found or not active.');
    }

    if (requesterRole === 'customer' && booking.customer_id !== requesterId) {
      throw new Error('Forbidden.');
    }

    let newStatus: string;
    if (requesterRole === 'admin') {
      newStatus = 'returned';
    } else {
      // Customer cancels
      const today = new Date();
      if (today >= booking.rent_start_date) {
        throw new Error('Cannot cancel on or after start date.');
      }
      newStatus = 'cancelled';
    }

    const updated = await tx.bookings.update({
      where: { id },
      data: { status: newStatus },
    });

    await tx.vehicles.update({
      where: { id: booking.vehicle_id },
      data: { availability_status: 'available' },
    });

    return updated;
  });
};

export const autoReturnExpiredBookingsService = async () => {
  const now = new Date();
  
  return await prisma.$transaction(async (tx: any) => {
    // Find all active bookings where rent_end_date has passed
    const expiredBookings = await tx.bookings.findMany({
      where: {
        status: 'active',
        rent_end_date: { lt: now },
      },
    });

    if (expiredBookings.length === 0) return 0;

    const bookingIds = expiredBookings.map((b: any) => b.id);
    const vehicleIds = expiredBookings.map((b: any) => b.vehicle_id);

    // Update bookings to returned
    await tx.bookings.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: 'returned' },
    });

    // Update vehicles to available
    await tx.vehicles.updateMany({
      where: { id: { in: vehicleIds } },
      data: { availability_status: 'available' },
    });

    return expiredBookings.length;
  });
};
