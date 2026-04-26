import { Request, Response, NextFunction } from 'express';
import { signupService, signinService } from './auth.service';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, message: 'name, email, password, and phone are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    const user = await signupService({ name, email, password, phone, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'email and password are required.' });
      return;
    }

    const result = await signinService({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
