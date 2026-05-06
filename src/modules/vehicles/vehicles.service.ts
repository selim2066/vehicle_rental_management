import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const createVehicleService = async (data: any) => {
  const { images, features, ...vehicleData } = data;

  return await prisma.vehicles.create({
    data: {
      ...vehicleData,
      vehicle_images: {
        create: images?.map((url: string, index: number) => ({
          image_url: url,
          is_primary: index === 0,
          sort_order: index,
        })),
      },
      vehicle_features: {
        create: features?.map((f: string) => ({ feature: f })),
      },
    },
    include: {
      vehicle_images: true,
      vehicle_features: true,
    },
  });
};

export const getAllVehiclesService = async (query: any) => {
  const {
    search,
    type,
    brand,
    min_price,
    max_price,
    fuel_type,
    transmission,
    availability,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.vehiclesWhereInput = {};

  if (search) {
    where.OR = [
      { vehicle_name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type) where.type = type;
  if (brand) where.brand = brand;
  if (fuel_type) where.fuel_type = fuel_type;
  if (transmission) where.transmission = transmission;
  if (availability) where.availability_status = availability;

  if (min_price || max_price) {
    where.daily_rent_price = {
      gte: min_price ? new Prisma.Decimal(min_price) : undefined,
      lte: max_price ? new Prisma.Decimal(max_price) : undefined,
    };
  }

  let orderBy: Prisma.vehiclesOrderByWithRelationInput = { created_at: 'desc' };
  if (sort === 'price_asc') orderBy = { daily_rent_price: 'asc' };
  if (sort === 'price_desc') orderBy = { daily_rent_price: 'desc' };
  if (sort === 'name_asc') orderBy = { vehicle_name: 'asc' };

  const [vehicles, total] = await Promise.all([
    prisma.vehicles.findMany({
      where,
      include: {
        vehicle_images: {
          where: { is_primary: true },
          take: 1,
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.vehicles.count({ where }),
  ]);

  return {
    vehicles,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getFeaturedVehiclesService = async () => {
  return await prisma.vehicles.findMany({
    where: { is_featured: true },
    include: {
      vehicle_images: {
        where: { is_primary: true },
        take: 1,
      },
    },
    take: 8,
  });
};

export const getVehicleByIdService = async (id: number) => {
  const vehicle = await prisma.vehicles.findUnique({
    where: { id },
    include: {
      vehicle_images: { orderBy: { sort_order: 'asc' } },
      vehicle_features: true,
      reviews: {
        include: {
          users: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!vehicle) {
    const err: any = new Error('Vehicle not found.');
    err.statusCode = 404;
    throw err;
  }

  // Calculate average rating
  const stats = await prisma.reviews.aggregate({
    where: { vehicle_id: id },
    _avg: { rating: true },
    _count: { id: true },
  });

  return {
    ...vehicle,
    average_rating: stats._avg.rating || 0,
    total_reviews: stats._count.id,
  };
};

export const getRelatedVehiclesService = async (id: number) => {
  const vehicle = await prisma.vehicles.findUnique({ where: { id }, select: { type: true } });
  if (!vehicle) return [];

  return await prisma.vehicles.findMany({
    where: {
      type: vehicle.type,
      id: { not: id },
    },
    include: {
      vehicle_images: { where: { is_primary: true }, take: 1 },
    },
    take: 4,
  });
};

export const updateVehicleService = async (id: number, data: any) => {
  const { images, features, ...vehicleData } = data;

  // For simplicity in this step, we'll just update vehicle fields. 
  // Real image/feature management would involve more complex logic (syncing arrays).
  return await prisma.vehicles.update({
    where: { id },
    data: vehicleData,
  });
};

export const deleteVehicleService = async (id: number) => {
  // Check for active bookings
  const activeBookings = await prisma.bookings.count({
    where: { vehicle_id: id, status: 'active' },
  });

  if (activeBookings > 0) {
    const err: any = new Error('Cannot delete vehicle with active bookings.');
    err.statusCode = 400;
    throw err;
  }

  return await prisma.vehicles.delete({ where: { id } });
};
