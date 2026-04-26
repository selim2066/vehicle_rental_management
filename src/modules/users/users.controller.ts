import { Request, Response, NextFunction } from 'express';
import { getAllUsersService, updateUserService, deleteUserService } from './users.service';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }

    const requesterId = req.user!.id;
    const requesterRole = req.user!.role;

    const user = await updateUserService(userId, requesterId, requesterRole, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }

    await deleteUserService(userId);

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
