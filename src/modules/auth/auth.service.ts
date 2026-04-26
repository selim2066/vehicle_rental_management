import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { jwtConfig } from '../../config/jwt';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'admin' | 'customer';
}

export interface SigninInput {
  email: string;
  password: string;
}

export const signupService = async (data: SignupInput) => {
  const { name, email, password, phone, role = 'customer' } = data;

  // Check if email already exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existing.rows.length > 0) {
    const err: any = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role, created_at`,
    [name, email.toLowerCase(), hashedPassword, phone, role]
  );

  return result.rows[0];
};

export const signinService = async (data: SigninInput) => {
  const { email, password } = data;

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    const err: any = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err: any = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn } as any
  );

  const { password: _pw, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};
