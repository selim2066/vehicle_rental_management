import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueChartData,
  getBookingsByStatus,
  getVehiclesByType,
  getRecentActivity,
} from './dashboard.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// All dashboard routes are admin only
router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueChartData);
router.get('/bookings-status', getBookingsByStatus);
router.get('/vehicles-type', getVehiclesByType);
router.get('/recent-activity', getRecentActivity);

export default router;
