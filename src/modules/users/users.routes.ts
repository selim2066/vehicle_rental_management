import { Router } from 'express';
import { getAllUsers, updateUser, deleteUser } from './users.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/users — Admin only
router.get('/', authenticate, authorizeAdmin, getAllUsers);

// PUT /api/v1/users/:userId — Admin or own customer
router.put('/:userId', authenticate, updateUser);

// DELETE /api/v1/users/:userId — Admin only
router.delete('/:userId', authenticate, authorizeAdmin, deleteUser);

export default router;
