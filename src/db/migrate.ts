import pool from '../config/database';

const createTables = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255)        NOT NULL,
        email       VARCHAR(255)        NOT NULL UNIQUE,
        password    VARCHAR(255)        NOT NULL,
        phone       VARCHAR(50)         NOT NULL,
        role        VARCHAR(20)         NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('admin', 'customer')),
        created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
      );
    `);

    // Vehicles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id                    SERIAL PRIMARY KEY,
        vehicle_name          VARCHAR(255)    NOT NULL,
        type                  VARCHAR(20)     NOT NULL
                              CHECK (type IN ('car', 'bike', 'van', 'SUV', 'suv', 'sports', 'luxury', 'sedan', 'electric', 'coupe', 'truck')),
        registration_number   VARCHAR(100)    NOT NULL UNIQUE,
        daily_rent_price      NUMERIC(10, 2)  NOT NULL CHECK (daily_rent_price > 0),
        availability_status   VARCHAR(20)     NOT NULL DEFAULT 'available'
                              CHECK (availability_status IN ('available', 'booked')),
        created_at            TIMESTAMP       NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMP       NOT NULL DEFAULT NOW()
      );
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id              SERIAL PRIMARY KEY,
        customer_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        vehicle_id      INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
        rent_start_date DATE            NOT NULL,
        rent_end_date   DATE            NOT NULL,
        total_price     NUMERIC(10, 2)  NOT NULL CHECK (total_price > 0),
        status          VARCHAR(20)     NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'cancelled', 'returned')),
        created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_dates CHECK (rent_end_date > rent_start_date)
      );
    `);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch((err) => {
  console.error(err);
  process.exit(1);
});
