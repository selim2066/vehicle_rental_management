import bcrypt from "bcrypt";
import pool from "../config/database";

const seed = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Admin credentials
    const adminEmail = "mdselimreza2066@gmail.com";
    const adminPlainPassword = "admin123";
    const adminPassword = await bcrypt.hash(adminPlainPassword, 10);

    console.log("Creating/Updating admin user...");
    await client.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
       password = EXCLUDED.password,
       name = EXCLUDED.name,
       phone = EXCLUDED.phone,
       role = EXCLUDED.role`,
      [
        "Admin User",
        adminEmail,
        adminPassword,
        "01580912090",
        "admin",
      ],
    );

    // Customer credentials
    const customerEmail = "selim@example.com";
    const customerPlainPassword = "selim123";
    const customerPassword = await bcrypt.hash(customerPlainPassword, 10);

    console.log("Creating/Updating customer user...");
    await client.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
       password = EXCLUDED.password,
       name = EXCLUDED.name,
       phone = EXCLUDED.phone,
       role = EXCLUDED.role`,
      [
        "Md Selim Reza",
        customerEmail,
        customerPassword,
        "01707453950",
        "customer",
      ],
    );

    // Create sample vehicles
    const vehicles = [
      ["Toyota X Corolla 2026 Edition", "car", "DHK-CA-1234", 2500.0, "available"],
      ["Honda CBR 150R", "bike", "DHK-BK-5678", 800.0, "available"],
      ["Toyota HiAce", "van", "DHK-VN-9012", 4000.0, "available"],
      ["Ford Everest", "SUV", "DHK-SV-3456", 5500.0, "available"],
    ];

    console.log("Inserting sample vehicles...");
    for (const v of vehicles) {
      await client.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (registration_number) DO UPDATE SET
         vehicle_name = EXCLUDED.vehicle_name,
         type = EXCLUDED.type,
         daily_rent_price = EXCLUDED.daily_rent_price,
         availability_status = EXCLUDED.availability_status`,
        v,
      );
    }

    await client.query("COMMIT");

    console.log("\n✅ Seed data updated successfully!");
    console.log("\n----------------------------");
    console.log("Admin credentials:");
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPlainPassword}`);
    console.log("----------------------------");
    console.log("Customer credentials:");
    console.log(`   Email:    ${customerEmail}`);
    console.log(`   Password: ${customerPlainPassword}`);
    console.log("----------------------------\n");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
