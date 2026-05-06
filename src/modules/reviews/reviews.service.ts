import prisma from '../../config/prisma';

export const createReviewService = async (data: {
  vehicle_id: number;
  user_id: number;
  booking_id?: number;
  rating: number;
  comment?: string;
}) => {
  return await prisma.reviews.create({
    data,
  });
};

export const getVehicleReviewsService = async (vehicleId: number) => {
  return await prisma.reviews.findMany({
    where: { vehicle_id: vehicleId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const updateReviewService = async (
  reviewId: number,
  userId: number,
  data: { rating?: number; comment?: string }
) => {
  return await prisma.reviews.update({
    where: {
      id: reviewId,
      user_id: userId, // Ensure owner
    },
    data,
  });
};

export const deleteReviewService = async (reviewId: number, userId: number, isAdmin: boolean) => {
  return await prisma.reviews.delete({
    where: isAdmin 
      ? { id: reviewId } 
      : { id: reviewId, user_id: userId },
  });
};
