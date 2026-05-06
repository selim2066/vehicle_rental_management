import { Request, Response, NextFunction } from 'express';
import {
  createVehicleService,
  getAllVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
  getFeaturedVehiclesService,
  getRelatedVehiclesService,
} from './vehicles.service';

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await createVehicleService(req.body);
    res.status(201).json({ success: true, message: 'Vehicle created successfully.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const getAllVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllVehiclesService(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await getFeaturedVehiclesService();
    res.status(200).json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    const vehicle = await getVehicleByIdService(vehicleId);
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const getRelatedVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    const vehicles = await getRelatedVehiclesService(vehicleId);
    res.status(200).json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    const vehicle = await updateVehicleService(vehicleId, req.body);
    res.status(200).json({ success: true, message: 'Vehicle updated successfully.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId, 10);
    await deleteVehicleService(vehicleId);
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
