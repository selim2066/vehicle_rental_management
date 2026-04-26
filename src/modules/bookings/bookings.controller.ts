import { Request, Response, NextFunction } from 'express';
import {
  createBookingService,
  getAllBookingsService,
  updateBookingService,
} from './bookings.service';

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      res.status(400).json({ success: false, message: 'vehicle_id, rent_start_date, and rent_end_date are required.' });
      return;
    }

    const customerId = req.user!.id;
    const booking = await createBookingService(customerId, {
      vehicle_id: Number(vehicle_id),
      rent_start_date,
      rent_end_date,
    });

    res.status(201).json({ success: true, message: 'Booking created successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await getAllBookingsService(req.user!.id, req.user!.role);
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID.' });
      return;
    }

    const booking = await updateBookingService(bookingId, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Booking updated successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};
