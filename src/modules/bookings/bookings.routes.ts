import { Router } from 'express';
import { createBooking, getAllBookings, updateBooking, getBookingById } from './bookings.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// POST /api/v1/bookings
router.post('/', createBooking);

// GET /api/v1/bookings
router.get('/', getAllBookings);

// GET /api/v1/bookings/:bookingId
router.get('/:bookingId', getBookingById);

// PUT /api/v1/bookings/:bookingId
router.put('/:bookingId', updateBooking);

export default router;
