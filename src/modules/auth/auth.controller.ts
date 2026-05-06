import { Request, Response, NextFunction } from 'express';
import { signupService, signinService, refreshTokenService, signoutService } from './auth.service';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await signupService(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully.', data: user });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await signinService(req.body);
    res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    const tokens = await refreshTokenService(token);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

export const signout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (token) {
      await signoutService(token);
    }
    res.status(200).json({ success: true, message: 'Signed out successfully.' });
  } catch (err) {
    next(err);
  }
};
