

```markdown
#  Premium Vehicle Rental System

A production-ready, high-performance REST API for a Vehicle Rental Management System. Built with **Node.js**, **Express**, and **PostgreSQL**, using **Prisma ORM** for type-safe database interactions and **NeonDB** for cloud-scale performance.

---

## 🌟 Key Features

-    **Advanced Authentication**: JWT-based auth with Access & Refresh token rotation and bcrypt password hashing.
-    **Role-Based Access Control (RBAC)**: Distinct permissions for **Admins** and **Customers**.
-    **Dynamic Fleet Management**: Complete CRUD for vehicles with advanced filtering (brand, type, price range).
-    **Smart Booking System**: Real-time availability checking, transaction-safe booking, and automatic price calculation.
-    **Admin Dashboard**: Live statistics for total revenue, active bookings, and fleet utilization.
-   **Review System**: Customers can rate and review vehicles after their rental.
-   **Newsletter Integration**: Seamless email subscription for marketing and updates.
-   **Seed System**: Instant database population with rich test data for development.

---

##   Tech Stack

-   **Runtime**: [Node.js](https://nodejs.org/) (v18+)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on [Neon](https://neon.tech/))
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Security**: [JWT](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
-   **Dev Tools**: [ts-node-dev](https://github.com/wclr/ts-node-dev), [Postman](https://www.postman.com/)

---

##  Project Structure

```text
src/
├── config/             # DB Pool, Prisma Client, JWT settings
├── db/                 # Migration & Seed scripts
├── middlewares/        # Auth, Role guards, Error handling
├── modules/            # Domain-driven modules
│   ├── auth/           # Login, Signup, Token Refresh
│   ├── users/          # Profile & User management
│   ├── vehicles/       # Fleet & Filtering
│   ├── bookings/       # Rental logic & Transactions
│   ├── reviews/        # Vehicle feedback
│   ├── newsletter/     # Email subscriptions
│   └── dashboard/      # Admin analytics
├── app.ts              # App configuration
└── server.ts           # Entry point
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/your-username/vehicle-rental.git
cd vehicle-rental
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="your_secret_key"
```

### 3. Database Initialization
```bash
# Push schema to NeonDB
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# Seed the database with test data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🧪 Testing with Postman

1. Import the `VehicleRental.postman_collection.json` file into Postman.
2. The collection includes **pre-request scripts** that automatically handle authentication tokens.
3. Test credentials (created via `npm run db:seed`):
    - **Admin**: `mdselimreza2066@gmail.com` / `admin123`
    - **Customer**: `selim@example.com` / `selim123`

---

## 🌐 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signin` | User Login (Returns tokens) | Public |
| `GET` | `/api/v1/vehicles` | List & Filter Vehicles | Public |
| `POST` | `/api/v1/bookings` | Create a New Booking | Auth |
| `GET` | `/api/v1/dashboard/stats` | Get Admin Analytics | Admin |
| `POST` | `/api/v1/reviews` | Submit Vehicle Review | Customer |

---

##  Business Logic & Validation

-   **Atomic Bookings**: Uses Prisma transactions to ensure vehicles aren't double-booked.
-   **Price Engine**: Automatically calculates total rent based on `daily_rent_price` and date range.
-   **Security**: Password hashing via `bcrypt` and protected routes via JWT middleware.
-   **Sanitization**: All inputs are validated and sanitized before reaching the database.

---

Author [MdSelim Reza](https://github.com/selim2066)
```