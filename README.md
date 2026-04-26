# 🚗 Vehicle Rental System API

A backend REST API for a vehicle rental management system built with Node.js, TypeScript, Express.js, and PostgreSQL.

---

## 🛠️ Technology Stack

- **Node.js** + **TypeScript**
- **Express.js** – Web framework
- **PostgreSQL** – Database
- **bcrypt** – Password hashing
- **jsonwebtoken** – JWT authentication

---

## 📁 Project Structure

```
src/
├── config/
│   ├── database.ts        # PostgreSQL connection pool
│   └── jwt.ts             # JWT configuration
├── db/
│   └── migrate.ts         # Database migration script
├── middlewares/
│   ├── auth.middleware.ts  # JWT auth + role authorization
│   └── error.middleware.ts # Global error handler
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.routes.ts
│   ├── vehicles/
│   │   ├── vehicles.service.ts
│   │   ├── vehicles.controller.ts
│   │   └── vehicles.routes.ts
│   └── bookings/
│       ├── bookings.service.ts
│       ├── bookings.controller.ts
│       └── bookings.routes.ts
├── app.ts                 # Express app setup
└── server.ts              # Entry point
```

---

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd vehicle-rental-system
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vehicle_rental
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 3. Create PostgreSQL Database

```sql
CREATE DATABASE vehicle_rental;
```

### 4. Run Database Migration

```bash
npm run db:migrate
```

### 5. (Optional) Seed Sample Data

```bash
npm run db:seed
```

This creates ready-to-use test accounts:
- **Admin:** admin@vehiclerental.com / admin123
- **Customer:** john@example.com / customer123
- **4 sample vehicles** (car, bike, van, SUV)

### 6. Start Development Server

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
npm start
```

---

## 🌐 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/signin` | Login, receive JWT |

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/vehicles` | Admin | Add new vehicle |
| GET | `/api/v1/vehicles` | Public | Get all vehicles |
| GET | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle by ID |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | Get all users |
| PUT | `/api/v1/users/:userId` | Admin/Own | Update user |
| DELETE | `/api/v1/users/:userId` | Admin | Delete user |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Auth | Create booking |
| GET | `/api/v1/bookings` | Auth | Get bookings (role-based) |
| PUT | `/api/v1/bookings/:bookingId` | Auth | Cancel/Return booking |

---

## 🔐 Authentication

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## 📋 Example Requests

### Register a User
```json
POST /api/v1/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "01711000000",
  "role": "customer"
}
```

### Login
```json
POST /api/v1/auth/signin
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create a Vehicle (Admin)
```json
POST /api/v1/vehicles
Authorization: Bearer <admin_token>
{
  "vehicle_name": "Toyota Camry",
  "type": "car",
  "registration_number": "DHK-1234",
  "daily_rent_price": 2500,
  "availability_status": "available"
}
```

### Create a Booking
```json
POST /api/v1/bookings
Authorization: Bearer <customer_token>
{
  "vehicle_id": 1,
  "rent_start_date": "2025-02-01",
  "rent_end_date": "2025-02-05"
}
```
> Total price is automatically calculated: 4 days × 2500 = 10,000

---

## ✅ Business Logic

- Passwords are hashed with bcrypt before storage
- JWT tokens expire in 7 days by default
- Vehicle availability is checked and locked (transaction) when booking
- Total price = `daily_rent_price × number of days`
- Customers can only cancel bookings **before** the start date
- Admins can mark bookings as **returned** (vehicle becomes available again)
- Expired bookings are auto-returned every hour on server startup
- Deleting a user or vehicle with active bookings is blocked

---

## 🧪 Postman Collection

Import `VehicleRental.postman_collection.json` into Postman.

The collection includes all endpoints with pre-set body examples. After running **Signin (Admin)** or **Signin (Customer)**, the token is automatically saved as a collection variable and used in all subsequent requests.

---

## ⚙️ Response Format

All responses follow a consistent structure:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }
}
```
# vehicle_rental_management
