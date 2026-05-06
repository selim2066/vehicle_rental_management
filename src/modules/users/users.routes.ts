import { Router } from 'express';
import { getMe, updateMe, getAllUsers, updateUser, deleteUser } from './users.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Profile routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllUsers);
router.put('/:userId', authenticate, authorizeAdmin, updateUser);
router.delete('/:userId', authenticate, authorizeAdmin, deleteUser);

export default router;
