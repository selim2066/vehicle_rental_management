import bcrypt from 'bcrypt';
import pool from '../../config/database';

export const getAllUsersService = async () => {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY id ASC'
  );
  return result.rows;
};

export const updateUserService = async (
  userId: number,
  requesterId: number,
  requesterRole: string,
  data: Partial<{ name: string; email: string; password: string; phone: string; role: string }>
) => {
  // Customers can only update themselves
  if (requesterRole === 'customer' && userId !== requesterId) {
    const err: any = new Error('Forbidden. You can only update your own profile.');
    err.statusCode = 403;
    throw err;
  }

  // Customers cannot change their own role
  if (requesterRole === 'customer' && data.role) {
    const err: any = new Error('Forbidden. Customers cannot change their role.');
    err.statusCode = 403;
    throw err;
  }

  // Check user exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE id = $1',
    [userId]
  );
  if (existing.rows.length === 0) {
    const err: any = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email.toLowerCase()); }
  if (data.phone) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.role && requesterRole === 'admin') { fields.push(`role = $${idx++}`); values.push(data.role); }
  if (data.password) {
    const hashed = await bcrypt.hash(data.password, 10);
    fields.push(`password = $${idx++}`);
    values.push(hashed);
  }

  if (fields.length === 0) {
    const err: any = new Error('No valid fields to update.');
    err.statusCode = 400;
    throw err;
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, name, email, phone, role, created_at, updated_at`,
    values
  );

  return result.rows[0];
};

export const deleteUserService = async (userId: number) => {
  // Check user exists
  const existing = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
  if (existing.rows.length === 0) {
    const err: any = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // Check no active bookings
  const activeBookings = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [userId]
  );
  if (activeBookings.rows.length > 0) {
    const err: any = new Error('Cannot delete user with active bookings.');
    err.statusCode = 400;
    throw err;
  }

  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};
