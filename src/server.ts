import app from './app';
import { autoReturnExpiredBookingsService } from './modules/bookings/bookings.service';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚗 Vehicle Rental API running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
});

// Auto-return expired bookings every hour
const AUTO_RETURN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const runAutoReturn = async () => {
  try {
    const count = await autoReturnExpiredBookingsService();
    if (count > 0) {
      console.log(`🔄 Auto-returned ${count} expired booking(s).`);
    }
  } catch (err) {
    console.error('Auto-return error:', err);
  }
};

// Run once on startup, then every hour
runAutoReturn();
setInterval(runAutoReturn, AUTO_RETURN_INTERVAL_MS);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default server;
