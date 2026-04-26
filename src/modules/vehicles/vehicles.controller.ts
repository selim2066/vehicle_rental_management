import { Request, Response, NextFunction } from 'express';
import {
  createVehicleService,
  getAllVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
} from './vehicles.service';

export const createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    if (!vehicle_name || !type || !registration_number || daily_rent_price === undefined) {
      res.status(400).json({ success: false, message: 'vehicle_name, type, registration_number, and daily_rent_price are required.' });
      return;
    }

    if (Number(daily_rent_price) <= 0) {
      res.status(400).json({ success: false, message: 'daily_rent_price must be a positive number.' });
      return;
    }

    const vehicle = await createVehicleService({ vehicle_name, type, registration_number, daily_rent_price: Number(daily_rent_price), availability_status });

    res.status(201).json({ success: true, message: 'Vehicle created successfully.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const getAllVehicles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicles = await getAllVehiclesService();
    res.status(200).json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    if (isNaN(vehicleId)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID.' });
      return;
    }

    const vehicle = await getVehicleByIdService(vehicleId);
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    if (isNaN(vehicleId)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID.' });
      return;
    }

    const vehicle = await updateVehicleService(vehicleId, req.body);
    res.status(200).json({ success: true, message: 'Vehicle updated successfully.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    if (isNaN(vehicleId)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID.' });
      return;
    }

    await deleteVehicleService(vehicleId);
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
