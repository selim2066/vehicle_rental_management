import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import vehicleRoutes from './modules/vehicles/vehicles.routes';
import bookingRoutes from './modules/bookings/bookings.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Vehicle Rental API is running now.' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy.' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
