import pool from '../config/database';

const fixTypeConstraint = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Fixing vehicle type constraint...');

    // 1. Drop existing constraint if it exists
    // The default name in PG is usually 'vehicles_type_check'
    await client.query(`
      ALTER TABLE vehicles 
      DROP CONSTRAINT IF EXISTS vehicles_type_check;
    `);

    // 2. Add the expanded constraint
    // Including all types from frontend and some future-proofing ones
    await client.query(`
      ALTER TABLE vehicles 
      ADD CONSTRAINT vehicles_type_check 
      CHECK (type IN (
        'car', 'bike', 'van', 'SUV', 'suv', 
        'sports', 'luxury', 'sedan', 'electric', 
        'coupe', 'truck', 'convertible', 'compact'
      ));
    `);

    await client.query('COMMIT');
    console.log('✅ Vehicle type constraint updated successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to update constraint:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

fixTypeConstraint().catch((err) => {
  console.error(err);
  process.exit(1);
});
