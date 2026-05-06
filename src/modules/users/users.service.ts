import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';

export const getAllUsersService = async (query: any) => {
  const { page = 1, limit = 10, search } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        is_active: true,
        created_at: true,
      },
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getUserByIdService = async (id: number) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      bio: true,
      address: true,
      is_active: true,
      created_at: true,
    },
  });

  if (!user) {
    const err: any = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

export const updateUserService = async (id: number, data: any) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return await prisma.users.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      bio: true,
      address: true,
      is_active: true,
    },
  });
};

export const deleteUserService = async (id: number) => {
  const activeBookings = await prisma.bookings.count({
    where: { customer_id: id, status: 'active' },
  });

  if (activeBookings > 0) {
    const err: any = new Error('Cannot delete user with active bookings.');
    err.statusCode = 400;
    throw err;
  }

  return await prisma.users.update({
    where: { id },
    data: { is_active: false }, // Soft delete/deactivate
  });
};
