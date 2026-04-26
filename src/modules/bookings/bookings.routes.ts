import { Router } from 'express';
import { createBooking, getAllBookings, updateBooking } from './bookings.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/bookings — Customer or Admin
router.post('/', authenticate, createBooking);

// GET /api/v1/bookings — Role-based (Admin: all, Customer: own)
router.get('/', authenticate, getAllBookings);

// PUT /api/v1/bookings/:bookingId — Customer (cancel) or Admin (return)
router.put('/:bookingId', authenticate, updateBooking);

export default router;
