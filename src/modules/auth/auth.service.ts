import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { jwtConfig } from '../../config/jwt';

export const signupService = async (data: any) => {
  const { name, email, password, phone, role = 'customer' } = data;

  const existing = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    const err: any = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.users.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      created_at: true,
    },
  });
};

export const generateTokens = (user: { id: number; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: '15m' } // Short lived access token
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const signinService = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err: any = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token
  await prisma.refresh_tokens.create({
    data: {
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const { password: _pw, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
  const storedToken = await prisma.refresh_tokens.findUnique({
    where: { token },
    include: { users: true },
  });

  if (!storedToken || storedToken.expires_at < new Date()) {
    const err: any = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const tokens = generateTokens(storedToken.users);

  // Rotate token: delete old, create new
  await prisma.refresh_tokens.delete({ where: { id: storedToken.id } });
  await prisma.refresh_tokens.create({
    data: {
      user_id: storedToken.user_id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
};

export const signoutService = async (token: string) => {
  return await prisma.refresh_tokens.deleteMany({
    where: { token },
  });
};
