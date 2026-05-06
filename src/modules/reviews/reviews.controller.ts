import { Request, Response, NextFunction } from 'express';
import {
  createReviewService,
  getVehicleReviewsService,
  updateReviewService,
  deleteReviewService,
} from './reviews.service';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicle_id, booking_id, rating, comment } = req.body;
    const userId = req.user!.id;

    if (!vehicle_id || !rating) {
      res.status(400).json({ success: false, message: 'vehicle_id and rating are required.' });
      return;
    }

    const review = await createReviewService({
      vehicle_id: Number(vehicle_id),
      user_id: userId,
      booking_id: booking_id ? Number(booking_id) : undefined,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const getVehicleReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    const reviews = await getVehicleReviewsService(vehicleId);
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
    const userId = req.user!.id;
    const review = await updateReviewService(reviewId, userId, req.body);
    res.status(200).json({ success: true, message: 'Review updated successfully.', data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    await deleteReviewService(reviewId, userId, isAdmin);
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
