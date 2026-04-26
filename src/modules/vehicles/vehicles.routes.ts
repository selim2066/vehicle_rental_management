import { Router } from 'express';
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from './vehicles.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/vehicles — Admin only
router.post('/', authenticate, authorizeAdmin, createVehicle);

// GET /api/v1/vehicles — Public
router.get('/', getAllVehicles);

// GET /api/v1/vehicles/:vehicleId — Public
router.get('/:vehicleId', getVehicleById);

// PUT /api/v1/vehicles/:vehicleId — Admin only
router.put('/:vehicleId', authenticate, authorizeAdmin, updateVehicle);

// DELETE /api/v1/vehicles/:vehicleId — Admin only
router.delete('/:vehicleId', authenticate, authorizeAdmin, deleteVehicle);

export default router;
