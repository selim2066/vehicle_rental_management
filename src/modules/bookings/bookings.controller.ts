import { Request, Response, NextFunction } from 'express';
import {
  createBookingService,
  getAllBookingsService,
  updateBookingService,
  getBookingByIdService,
} from './bookings.service';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await createBookingService(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Booking created successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllBookingsService(req.user!.id, req.user!.role, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const booking = await getBookingByIdService(bookingId, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const booking = await updateBookingService(bookingId, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Booking updated successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};
