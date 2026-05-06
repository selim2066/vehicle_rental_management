import prisma from '../../config/prisma';

export const getDashboardStatsService = async () => {
  const [
    totalVehicles,
    availableVehicles,
    bookedVehicles,
    totalUsers,
    totalBookings,
    activeBookings,
    revenueData
  ] = await Promise.all([
    prisma.vehicles.count(),
    prisma.vehicles.count({ where: { availability_status: 'available' } }),
    prisma.vehicles.count({ where: { availability_status: 'booked' } }),
    prisma.users.count({ where: { role: 'customer' } }),
    prisma.bookings.count(),
    prisma.bookings.count({ where: { status: 'active' } }),
    prisma.bookings.aggregate({
      where: { status: 'returned' },
      _sum: { total_price: true }
    })
  ]);

  return {
    total_vehicles: totalVehicles,
    available_vehicles: availableVehicles,
    booked_vehicles: bookedVehicles,
    total_users: totalUsers,
    total_bookings: totalBookings,
    active_bookings: activeBookings,
    total_revenue: revenueData._sum.total_price || 0,
  };
};

export const getRevenueChartDataService = async (year: number) => {
  // Group bookings by month for a specific year
  const result = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(rent_start_date, 'Mon') as month,
      SUM(total_price) as revenue,
      COUNT(id) as bookings
    FROM bookings
    WHERE EXTRACT(YEAR FROM rent_start_date) = ${year}
    AND status = 'returned'
    GROUP BY month, EXTRACT(MONTH FROM rent_start_date)
    ORDER BY EXTRACT(MONTH FROM rent_start_date)
  `;
  return result;
};

export const getBookingsByStatusService = async () => {
  const result = await prisma.bookings.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });
  return result;
};

export const getVehiclesByTypeService = async () => {
  const result = await prisma.vehicles.groupBy({
    by: ['type'],
    _count: {
      id: true
    }
  });
  return result;
};

export const getRecentActivityService = async () => {
  const [recentBookings, recentUsers] = await Promise.all([
    prisma.bookings.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        users: { select: { name: true, email: true } },
        vehicles: { select: { vehicle_name: true } }
      }
    }),
    prisma.users.findMany({
      take: 5,
      where: { role: 'customer' },
      orderBy: { created_at: 'desc' },
      select: { id: true, name: true, email: true, created_at: true }
    })
  ]);

  return {
    recent_bookings: recentBookings,
    recent_users: recentUsers
  };
};
