import pool from '../../config/database';

export interface BookingInput {
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const getDaysDifference = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const createBookingService = async (
  customerId: number,
  data: BookingInput
) => {
  const { vehicle_id, rent_start_date, rent_end_date } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validate dates
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const err: any = new Error('Invalid date format.');
      err.statusCode = 400;
      throw err;
    }

    if (endDate <= startDate) {
      const err: any = new Error('rent_end_date must be after rent_start_date.');
      err.statusCode = 400;
      throw err;
    }

    // Lock the vehicle row to prevent race conditions
    const vehicleResult = await client.query(
      'SELECT * FROM vehicles WHERE id = $1 FOR UPDATE',
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      const err: any = new Error('Vehicle not found.');
      err.statusCode = 404;
      throw err;
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== 'available') {
      const err: any = new Error('Vehicle is not available for booking.');
      err.statusCode = 400;
      throw err;
    }

    // Calculate total price
    const days = getDaysDifference(rent_start_date, rent_end_date);
    const total_price = days * parseFloat(vehicle.daily_rent_price);

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [customerId, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    // Update vehicle status to 'booked'
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked', updated_at = NOW() WHERE id = $1`,
      [vehicle_id]
    );

    await client.query('COMMIT');
    return bookingResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getAllBookingsService = async (
  requesterId: number,
  requesterRole: string
) => {
  if (requesterRole === 'admin') {
    const result = await pool.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email,
              v.vehicle_name, v.type AS vehicle_type, v.registration_number
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN vehicles v ON b.vehicle_id = v.id
       ORDER BY b.id ASC`
    );
    return result.rows;
  } else {
    const result = await pool.query(
      `SELECT b.*, v.vehicle_name, v.type AS vehicle_type, v.registration_number
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.customer_id = $1
       ORDER BY b.id ASC`,
      [requesterId]
    );
    return result.rows;
  }
};

export const updateBookingService = async (
  bookingId: number,
  requesterId: number,
  requesterRole: string
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock and fetch booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      const err: any = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'active') {
      const err: any = new Error(`Booking is already ${booking.status}.`);
      err.statusCode = 400;
      throw err;
    }

    let newStatus: string;

    if (requesterRole === 'admin') {
      // Admin marks as returned → vehicle becomes available
      newStatus = 'returned';

      await client.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = NOW() WHERE id = $1`,
        [booking.vehicle_id]
      );
    } else {
      // Customer cancels — only before start date
      if (booking.customer_id !== requesterId) {
        const err: any = new Error('Forbidden. You can only manage your own bookings.');
        err.statusCode = 403;
        throw err;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(booking.rent_start_date);

      if (today >= startDate) {
        const err: any = new Error('Cannot cancel a booking on or after the start date.');
        err.statusCode = 400;
        throw err;
      }

      newStatus = 'cancelled';

      // Free up the vehicle
      await client.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = NOW() WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    const updatedResult = await client.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStatus, bookingId]
    );

    await client.query('COMMIT');
    return updatedResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Auto-mark bookings as returned when rental period has ended
export const autoReturnExpiredBookingsService = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const expiredResult = await client.query(
      `SELECT * FROM bookings WHERE status = 'active' AND rent_end_date < CURRENT_DATE`
    );

    for (const booking of expiredResult.rows) {
      await client.query(
        `UPDATE bookings SET status = 'returned', updated_at = NOW() WHERE id = $1`,
        [booking.id]
      );
      await client.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = NOW() WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    await client.query('COMMIT');
    return expiredResult.rows.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
