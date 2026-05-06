import { Router } from 'express';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getFeaturedVehicles,
  getRelatedVehicles,
} from './vehicles.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllVehicles);
router.get('/featured', getFeaturedVehicles);
router.get('/:vehicleId', getVehicleById);
router.get('/:vehicleId/related', getRelatedVehicles);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createVehicle);
router.put('/:vehicleId', authenticate, authorizeAdmin, updateVehicle);
router.delete('/:vehicleId', authenticate, authorizeAdmin, deleteVehicle);

export default router;
