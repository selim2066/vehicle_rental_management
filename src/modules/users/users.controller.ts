import { Request, Response, NextFunction } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from './users.service';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserByIdService(req.user!.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateUserService(req.user!.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: user });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllUsersService(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = await updateUserService(userId, req.body);
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    await deleteUserService(userId);
    res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};
