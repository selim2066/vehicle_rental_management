import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rich data...');

  // 1. Clear existing data
  await prisma.refresh_tokens.deleteMany();
  await prisma.reviews.deleteMany();
  await prisma.vehicle_features.deleteMany();
  await prisma.vehicle_images.deleteMany();
  await prisma.bookings.deleteMany();
  await prisma.vehicles.deleteMany();
  await prisma.users.deleteMany();

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('selim123', 10);

  const admin = await prisma.users.create({
    data: {
      name: 'Admin User',
      email: 'admin@vehiclerental.com',
      password: adminPassword,
      phone: '01580912090',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  const customer = await prisma.users.create({
    data: {
      name: 'Selim Reza',
      email: 'selim@example.com',
      password: customerPassword,
      phone: '01707453950',
      role: 'customer',
      avatar: 'https://i.pravatar.cc/150?u=selim',
    },
  });

  // 3. Create Vehicles with Images and Features
  const vehicles = [
    {
      vehicle_name: 'Toyota Camry 2023',
      type: 'car',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      registration_number: 'DHK-CA-1234',
      daily_rent_price: 2500,
      availability_status: 'available',
      fuel_type: 'petrol',
      transmission: 'automatic',
      seats: 5,
      is_featured: true,
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000',
      ],
      features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera'],
    },
    {
      vehicle_name: 'Honda CBR 150R',
      type: 'bike',
      brand: 'Honda',
      model: 'CBR 150R',
      year: 2022,
      registration_number: 'DHK-BK-5678',
      daily_rent_price: 800,
      availability_status: 'available',
      fuel_type: 'petrol',
      transmission: 'manual',
      seats: 2,
      is_featured: true,
      images: [
        'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=1000',
      ],
      features: ['ABS', 'Fuel Injection'],
    },
    {
      vehicle_name: 'Ford Everest 2023',
      type: 'SUV',
      brand: 'Ford',
      model: 'Everest',
      year: 2023,
      registration_number: 'DHK-SV-3456',
      daily_rent_price: 5500,
      availability_status: 'available',
      fuel_type: 'diesel',
      transmission: 'automatic',
      seats: 7,
      is_featured: true,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
      ],
      features: ['4WD', 'Sunroof', 'Leather Seats', 'Adaptive Cruise Control'],
    },
  ];

  for (const v of vehicles) {
    const { images, features, ...vData } = v;
    await prisma.vehicles.create({
      data: {
        ...vData,
        vehicle_images: {
          create: images.map((url, idx) => ({
            image_url: url,
            is_primary: idx === 0,
            sort_order: idx,
          })),
        },
        vehicle_features: {
          create: features.map((f) => ({ feature: f })),
        },
      },
    });
  }

  console.log('✅ Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
