import { Request, Response, NextFunction } from 'express';
import {
  getDashboardStatsService,
  getRevenueChartDataService,
  getBookingsByStatusService,
  getVehiclesByTypeService,
  getRecentActivityService,
} from './dashboard.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getRevenueChartData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    const data = await getRevenueChartDataService(year);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBookingsByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getBookingsByStatusService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getVehiclesByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getVehiclesByTypeService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getRecentActivityService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
