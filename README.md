<div align="center">

# 🚗 Vehicle Rental Management — Backend API

**Production-ready REST API for a full-stack vehicle rental platform.**  
Built with Node.js · Express · TypeScript · PostgreSQL · Prisma ORM

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [Project Structure](#-project-structure)

</div>

---

## Overview

This is the backend API for a vehicle rental management system supporting two user roles — **Admin** and **Customer** — with full booking lifecycle management, JWT-based authentication with refresh token rotation, Prisma ORM for type-safe database access, and a real-time dashboard with aggregated analytics.

The architecture follows a clean **Route → Controller → Service** pattern, keeping business logic decoupled from HTTP concerns and making the codebase easy to test, extend, and maintain.

---

## ✨ Features

**Authentication & Security**
- JWT access tokens (15-minute expiry) + rotating refresh tokens (7-day expiry)
- Secure signout with token invalidation stored in PostgreSQL
- Role-based access control — Admin and Customer guards on all protected routes
- bcrypt password hashing with salt rounds

**Vehicle Management**
- Full CRUD with multi-image gallery support (primary image + sorted gallery)
- Rich vehicle data: brand, model, year, color, seats, fuel type, transmission, mileage, location
- Structured feature tags per vehicle (e.g. GPS, ABS, Sunroof)
- Featured vehicle flag for homepage highlights
- Related vehicles by type for detail page cross-sell

**Booking System**
- Atomic booking creation using `prisma.$transaction` — prevents double-booking race conditions
- Auto-return scheduler: runs on startup and every hour, marks expired bookings as returned and frees vehicles
- Customer cancellation restricted to before the rental start date
- Admin return flow with instant vehicle availability reset
- Full booking history with pagination, status filter, and vehicle/customer join data

**Vehicle Search & Discovery**
- Full-text search across name, brand, and model (case-insensitive)
- Multi-filter support: type, brand, fuel type, transmission, availability, price range
- Flexible sorting: newest, price ascending/descending, name alphabetical
- Paginated responses with meta (total, page, limit, totalPages)

**Reviews & Ratings**
- One review per user per vehicle (enforced at DB level via unique constraint)
- Optional booking linkage for verified-rental badge logic
- Aggregate average rating and review count served on vehicle detail endpoint
- Owner-only edit, owner-or-admin delete

**Admin Dashboard Analytics**
- Overview stats: total vehicles, available vs booked, total users, bookings, active rentals, total revenue
- Monthly revenue chart with booking count (raw SQL aggregation by month)
- Bookings grouped by status (active / cancelled / returned) for pie chart
- Vehicles grouped by type (car / bike / van / SUV) for distribution chart
- Recent activity feed: last 5 bookings and last 5 registered customers

**Newsletter**
- Upsert subscription (idempotent — re-subscribing is safe)
- Admin subscriber list
- Admin-controlled unsubscribe

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.3 |
| Framework | Express 4.18 |
| ORM | Prisma 5.12 |
| Database | PostgreSQL 16 |
| Auth | JSON Web Tokens + bcrypt |
| Dev tooling | ts-node-dev, Prisma Studio |

---

## 📁 Project Structure

```
src/
├── app.ts                        # Express app — middleware, route registration
├── server.ts                     # HTTP server + auto-return scheduler
│
├── config/
│   ├── database.ts               # pg Pool (legacy raw queries)
│   ├── jwt.ts                    # JWT secret and expiry config
│   └── prisma.ts                 # PrismaClient singleton
│
├── middlewares/
│   ├── auth.middleware.ts        # authenticate, authorizeAdmin, authorizeCustomer
│   └── error.middleware.ts       # Global error handler + 404 handler
│
├── modules/
│   ├── auth/                     # signup, signin, refresh, signout
│   ├── users/                    # getMe, updateMe, admin CRUD
│   ├── vehicles/                 # CRUD + featured + related + search/filter
│   ├── bookings/                 # create, list, detail, cancel/return
│   ├── reviews/                  # CRUD with ownership guards
│   ├── dashboard/                # stats, charts, recent activity
│   └── newsletter/               # subscribe, unsubscribe, list
│
├── db/
│   ├── migrate.ts                # V1 base schema migration
│   ├── migrate-v2.ts             # V2 additive migration (safe, no data loss)
│   ├── seed.ts                   # V1 minimal seed
│   └── seed-v2.ts                # V2 rich seed with images, features, bookings, reviews
│
prisma/
└── schema.prisma                 # Full Prisma schema (introspected + annotated)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally or via a connection string (Supabase, Neon, Railway, etc.)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/vehicle-rental-backend.git
cd vehicle-rental-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/vehicle_rental

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_min_32_chars
```

> **Note:** `DATABASE_URL` is the only required database config. The individual `DB_HOST`, `DB_PORT` etc. fields in `.env.example` are preserved for legacy reference only.

### 4. Set up the database

**Option A — Fresh install (no existing database):**

```bash
# Run V1 base migration
npm run db:migrate

# Run V2 additive migration (adds new tables and columns)
npx ts-node src/db/migrate-v2.ts

# Generate Prisma client
npm run prisma:generate

# Seed with rich demo data
npx ts-node src/db/seed-v2.ts
```

**Option B — Existing database:**

```bash
# Introspect your live schema into Prisma (non-destructive)
npm run prisma:pull

# Generate Prisma client
npm run prisma:generate

# Run V2 additive migration to add new tables/columns
npx ts-node src/db/migrate-v2.ts
```

> ⚠️ **`migrate-v2.ts` is fully additive** — it uses `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` throughout. It will never drop tables, drop columns, or modify existing data.

### 5. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build && npm start
```

The API will be available at `http://localhost:5000`.

---

## 🔑 Demo Credentials

Seeded by `seed-v2.ts` — ready to use immediately after setup:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vehiclerental.com` | `admin123` |
| Customer | `selim@example.com` | `selim123` |

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

All authenticated requests require:
```
Authorization: Bearer <access_token>
```

---

### Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a new user |
| `POST` | `/signin` | Public | Login and receive access + refresh tokens |
| `POST` | `/refresh` | Public | Exchange a refresh token for new token pair |
| `POST` | `/signout` | Public | Invalidate the current refresh token |

**POST /signup — Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "01700000000"
}
```

**POST /signin — Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "customer" },
    "accessToken": "<jwt_15min>",
    "refreshToken": "<jwt_7d>"
  }
}
```

**POST /refresh — Request body:**
```json
{ "refreshToken": "<your_refresh_token>" }
```

---

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/me` | Auth | Get own profile |
| `PUT` | `/me` | Auth | Update own profile (name, phone, avatar, bio, address, password) |
| `GET` | `/` | Admin | List all users (paginated, searchable) |
| `PUT` | `/:userId` | Admin | Update any user |
| `DELETE` | `/:userId` | Admin | Soft-deactivate a user (blocks if active bookings exist) |

**GET / — Query params:** `?page=1&limit=10&search=john`

---

### Vehicles — `/api/v1/vehicles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List vehicles (filtered, sorted, paginated) |
| `GET` | `/featured` | Public | Get up to 8 featured vehicles |
| `GET` | `/:vehicleId` | Public | Get vehicle detail with images, features, reviews, and avg rating |
| `GET` | `/:vehicleId/related` | Public | Get up to 4 related vehicles by type |
| `POST` | `/` | Admin | Create vehicle with images and features |
| `PUT` | `/:vehicleId` | Admin | Update vehicle fields |
| `DELETE` | `/:vehicleId` | Admin | Delete vehicle (blocks if active bookings exist) |

**GET / — Query params:**

| Param | Type | Example | Description |
|---|---|---|---|
| `search` | string | `Toyota` | Full-text search on name, brand, model |
| `type` | string | `car` | Filter by type: `car`, `bike`, `van`, `SUV` |
| `brand` | string | `Ford` | Filter by brand |
| `fuel_type` | string | `petrol` | Filter by fuel type |
| `transmission` | string | `automatic` | Filter by transmission |
| `availability` | string | `available` | Filter by status: `available`, `booked` |
| `min_price` | number | `1000` | Minimum daily rent price |
| `max_price` | number | `5000` | Maximum daily rent price |
| `sort` | string | `price_asc` | Sort: `newest`, `price_asc`, `price_desc`, `name_asc` |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `12` | Results per page (default: 12) |

**POST / — Request body:**
```json
{
  "vehicle_name": "Toyota Camry 2023",
  "type": "car",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2023,
  "registration_number": "DHK-CA-1234",
  "daily_rent_price": 2500,
  "fuel_type": "petrol",
  "transmission": "automatic",
  "seats": 5,
  "color": "White",
  "location": "Dhaka",
  "description": "Comfortable sedan with modern features.",
  "is_featured": true,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "features": ["AC", "GPS", "Bluetooth", "Backup Camera"]
}
```

---

### Bookings — `/api/v1/bookings`

All booking routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Auth | Create a booking (atomic — prevents double-booking) |
| `GET` | `/` | Auth | List bookings — Admin sees all, Customer sees own |
| `GET` | `/:bookingId` | Auth | Get booking detail |
| `PUT` | `/:bookingId` | Auth | Customer cancels (before start date) or Admin marks as returned |

**POST / — Request body:**
```json
{
  "vehicle_id": 1,
  "rent_start_date": "2025-06-01",
  "rent_end_date": "2025-06-05"
}
```

**GET / — Query params:** `?page=1&limit=10&status=active&customer_id=2&vehicle_id=1`

**Total price** is calculated server-side: `days × daily_rent_price`. The client never sends a price.

---

### Reviews — `/api/v1/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/vehicle/:vehicleId` | Public | Get all reviews for a vehicle (with user avatar and name) |
| `POST` | `/` | Auth | Submit a review (one per user per vehicle, enforced at DB level) |
| `PUT` | `/:reviewId` | Auth (Owner) | Update own review |
| `DELETE` | `/:reviewId` | Auth (Owner or Admin) | Delete a review |

**POST / — Request body:**
```json
{
  "vehicle_id": 1,
  "rating": 5,
  "comment": "Excellent car, smooth ride and well-maintained.",
  "booking_id": 3
}
```

Rating must be an integer between **1 and 5** (enforced at database level via `CHECK` constraint).

---

### Dashboard — `/api/v1/dashboard`

All dashboard routes require Admin authentication.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Overview KPIs: vehicles, users, bookings, revenue |
| `GET` | `/revenue?year=2025` | Monthly revenue and booking count for bar/line chart |
| `GET` | `/bookings-status` | Booking counts grouped by status for pie chart |
| `GET` | `/vehicles-type` | Vehicle counts grouped by type for distribution chart |
| `GET` | `/recent-activity` | Last 5 bookings and last 5 registered customers |

**GET /stats — Response:**
```json
{
  "success": true,
  "data": {
    "total_vehicles": 12,
    "available_vehicles": 9,
    "booked_vehicles": 3,
    "total_users": 48,
    "total_bookings": 130,
    "active_bookings": 3,
    "total_revenue": "485000.00"
  }
}
```

---

### Newsletter — `/api/v1/newsletter`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/subscribe` | Public | Subscribe an email (idempotent upsert) |
| `GET` | `/subscribers` | Admin | List all subscribers |
| `POST` | `/unsubscribe` | Admin | Remove a subscriber by email |

**POST /subscribe — Request body:**
```json
{ "email": "user@example.com" }
```

---

## 🗄 Database Schema

The schema has 8 tables, all managed by Prisma after introspection.

```
users
  ├── id, name, email, password, phone, role
  ├── avatar, bio, address, is_active, google_id
  └── → bookings, reviews, refresh_tokens

vehicles
  ├── id, vehicle_name, type, registration_number
  ├── daily_rent_price, availability_status
  ├── brand, model, year, color, seats, fuel_type
  ├── transmission, mileage, location, description
  ├── is_featured
  └── → bookings, reviews, vehicle_images, vehicle_features

bookings
  ├── id, customer_id (FK), vehicle_id (FK)
  ├── rent_start_date, rent_end_date, total_price
  ├── status (active | cancelled | returned)
  └── → reviews

reviews
  └── id, vehicle_id (FK), user_id (FK), booking_id (FK?)
      rating (1–5), comment
      [UNIQUE: vehicle_id + user_id]

vehicle_images
  └── id, vehicle_id (FK), image_url, is_primary, sort_order

vehicle_features
  └── id, vehicle_id (FK), feature

refresh_tokens
  └── id, user_id (FK), token (UNIQUE), expires_at

newsletter_subscribers
  └── id, email (UNIQUE), subscribed_at
```

**Indexes** are created on all foreign keys and frequently-filtered columns (`availability_status`, `status`, `type`, `is_featured`, `token`) for query performance.

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) — plaintext passwords are never stored or returned
- Access tokens expire in **15 minutes** — short-lived to minimize exposure
- Refresh tokens are **rotated on every use** — the old token is deleted and a new one is issued atomically
- Signout **invalidates the refresh token** in the database — not just a client-side clear
- Users with active bookings **cannot be deleted** — referential integrity is enforced at the service layer
- Vehicles with active bookings **cannot be deleted** — same protection
- Soft-delete pattern for users (`is_active: false`) preserves historical booking data

---

## 🛠 Available Scripts

| Script | Command | Description |
|---|---|---|
| Start dev server | `npm run dev` | Hot-reload with ts-node-dev |
| Build for production | `npm run build` | Compile TypeScript to `dist/` |
| Start production | `npm start` | Run compiled `dist/server.js` |
| Run V1 migration | `npm run db:migrate` | Create base tables |
| Run V1 seed | `npm run db:seed` | Insert minimal demo data |
| Run V2 migration | `npx ts-node src/db/migrate-v2.ts` | Additive schema upgrade |
| Run V2 seed | `npx ts-node src/db/seed-v2.ts` | Insert rich demo data |
| Generate Prisma client | `npm run prisma:generate` | Rebuild Prisma types |
| Pull schema from DB | `npm run prisma:pull` | Introspect existing database |
| Open Prisma Studio | `npm run prisma:studio` | Visual database browser |

---

## 🔄 Refresh Token Flow

```
Client                          Server
  │                               │
  │── POST /auth/signin ─────────▶│
  │◀── { accessToken, refreshToken }
  │                               │
  │── API request (Bearer access) ▶│
  │◀── 200 OK                    │
  │                               │
  │  (access token expires)       │
  │                               │
  │── POST /auth/refresh ────────▶│ (send refreshToken in body)
  │◀── { accessToken, refreshToken }  (old refresh token deleted, new issued)
  │                               │
  │── POST /auth/signout ────────▶│ (send refreshToken in body)
  │◀── 200 OK (token deleted from DB)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with care for a production-ready portfolio. If this project helped you, please consider giving it a ⭐

</div>
