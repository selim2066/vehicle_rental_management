import { Router } from 'express';
import { createReview, getVehicleReviews, updateReview, deleteReview } from './reviews.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/reviews/vehicle/:vehicleId - Public
router.get('/vehicle/:vehicleId', getVehicleReviews);

// POST /api/v1/reviews - Authenticated
router.post('/', authenticate, createReview);

// PUT /api/v1/reviews/:reviewId - Authenticated (Owner)
router.put('/:reviewId', authenticate, updateReview);

// DELETE /api/v1/reviews/:reviewId - Authenticated (Owner or Admin)
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
