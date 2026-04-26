import pool from '../../config/database';

const VALID_TYPES = ['car', 'bike', 'van', 'SUV'];
const VALID_STATUS = ['available', 'booked'];

export interface VehicleInput {
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status?: string;
}

export const createVehicleService = async (data: VehicleInput) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status = 'available' } = data;

  if (!VALID_TYPES.includes(type)) {
    const err: any = new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (!VALID_STATUS.includes(availability_status)) {
    const err: any = new Error(`Invalid status. Must be 'available' or 'booked'.`);
    err.statusCode = 400;
    throw err;
  }

  // Check duplicate registration
  const existing = await pool.query(
    'SELECT id FROM vehicles WHERE registration_number = $1',
    [registration_number]
  );
  if (existing.rows.length > 0) {
    const err: any = new Error('Registration number already exists.');
    err.statusCode = 409;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
  );

  return result.rows[0];
};

export const getAllVehiclesService = async () => {
  const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
  return result.rows;
};

export const getVehicleByIdService = async (vehicleId: number) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);

  if (result.rows.length === 0) {
    const err: any = new Error('Vehicle not found.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

export const updateVehicleService = async (vehicleId: number, data: Partial<VehicleInput>) => {
  const existing = await pool.query('SELECT id FROM vehicles WHERE id = $1', [vehicleId]);
  if (existing.rows.length === 0) {
    const err: any = new Error('Vehicle not found.');
    err.statusCode = 404;
    throw err;
  }

  if (data.type && !VALID_TYPES.includes(data.type)) {
    const err: any = new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (data.availability_status && !VALID_STATUS.includes(data.availability_status)) {
    const err: any = new Error(`Invalid status. Must be 'available' or 'booked'.`);
    err.statusCode = 400;
    throw err;
  }

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.vehicle_name) { fields.push(`vehicle_name = $${idx++}`); values.push(data.vehicle_name); }
  if (data.type) { fields.push(`type = $${idx++}`); values.push(data.type); }
  if (data.registration_number) { fields.push(`registration_number = $${idx++}`); values.push(data.registration_number); }
  if (data.daily_rent_price !== undefined) { fields.push(`daily_rent_price = $${idx++}`); values.push(data.daily_rent_price); }
  if (data.availability_status) { fields.push(`availability_status = $${idx++}`); values.push(data.availability_status); }

  if (fields.length === 0) {
    const err: any = new Error('No valid fields to update.');
    err.statusCode = 400;
    throw err;
  }

  fields.push(`updated_at = NOW()`);
  values.push(vehicleId);

  const result = await pool.query(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteVehicleService = async (vehicleId: number) => {
  const existing = await pool.query('SELECT id FROM vehicles WHERE id = $1', [vehicleId]);
  if (existing.rows.length === 0) {
    const err: any = new Error('Vehicle not found.');
    err.statusCode = 404;
    throw err;
  }

  // Check no active bookings
  const activeBookings = await pool.query(
    `SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
    [vehicleId]
  );
  if (activeBookings.rows.length > 0) {
    const err: any = new Error('Cannot delete vehicle with active bookings.');
    err.statusCode = 400;
    throw err;
  }

  await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
};
