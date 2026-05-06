import pool from '../config/database';

const migrateV2 = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Running V2 additive migrations...\n');

    // 1. Alter users table (additive only)
    console.log('  → Extending users table...');
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS avatar      VARCHAR(500),
        ADD COLUMN IF NOT EXISTS bio          TEXT,
        ADD COLUMN IF NOT EXISTS address      TEXT,
        ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS google_id    VARCHAR(255);
    `);

    // Add unique constraint on google_id if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
        END IF;
      END
      $$;
    `);

    // 2. Alter vehicles table (additive only)
    console.log('  → Extending vehicles table...');
    await client.query(`
      ALTER TABLE vehicles
        ADD COLUMN IF NOT EXISTS description    TEXT,
        ADD COLUMN IF NOT EXISTS brand          VARCHAR(100),
        ADD COLUMN IF NOT EXISTS model          VARCHAR(100),
        ADD COLUMN IF NOT EXISTS year           INTEGER,
        ADD COLUMN IF NOT EXISTS color          VARCHAR(50),
        ADD COLUMN IF NOT EXISTS seats          INTEGER,
        ADD COLUMN IF NOT EXISTS fuel_type      VARCHAR(30),
        ADD COLUMN IF NOT EXISTS transmission   VARCHAR(20),
        ADD COLUMN IF NOT EXISTS mileage        NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS location       VARCHAR(255),
        ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    // 3. Create vehicle_images table
    console.log('  → Creating vehicle_images table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_images (
        id          SERIAL PRIMARY KEY,
        vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        image_url   VARCHAR(500) NOT NULL,
        is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Create vehicle_features table
    console.log('  → Creating vehicle_features table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_features (
        id          SERIAL PRIMARY KEY,
        vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        feature     VARCHAR(255) NOT NULL
      );
    `);

    // 5. Create reviews table
    console.log('  → Creating reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          SERIAL PRIMARY KEY,
        vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add unique constraint for one review per user per vehicle
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'reviews_vehicle_user_unique'
        ) THEN
          ALTER TABLE reviews ADD CONSTRAINT reviews_vehicle_user_unique UNIQUE (vehicle_id, user_id);
        END IF;
      END
      $$;
    `);

    // 6. Create newsletter_subscribers table
    console.log('  → Creating newsletter_subscribers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 7. Create refresh_tokens table
    console.log('  → Creating refresh_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token       TEXT NOT NULL UNIQUE,
        expires_at  TIMESTAMP NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Create indexes for performance
    console.log('  → Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle_id ON vehicle_features(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON reviews(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
      CREATE INDEX IF NOT EXISTS idx_vehicles_availability ON vehicles(availability_status);
      CREATE INDEX IF NOT EXISTS idx_vehicles_is_featured ON vehicles(is_featured);
      CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `);

    await client.query('COMMIT');
    console.log('\n✅ V2 migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ V2 migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrateV2().catch((err) => {
  console.error(err);
  process.exit(1);
});
