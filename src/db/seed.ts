import bcrypt from "bcrypt";
import pool from "../config/database";

const seed = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // todo: Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await client.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "Admin User",
        "admin@vehiclerental.com",
        adminPassword,
        "01580912090",
        "admin",
      ],
    );

    // todo: Create customer user
    const customerPassword = await bcrypt.hash("selim123", 10);
    await client.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "Selim Reza",
        "selim@example.com",
        customerPassword,
        "01711111111",
        "customer",
      ],
    );

    // todo: Create sample vehicles
    const vehicles = [
      ["Toyota Camry 2023", "car", "DHK-CA-1234", 2500.0, "available"],
      ["Honda CBR 150R", "bike", "DHK-BK-5678", 800.0, "available"],
      ["Toyota HiAce", "van", "DHK-VN-9012", 4000.0, "available"],
      ["Ford Everest", "SUV", "DHK-SV-3456", 5500.0, "available"],
    ];

    for (const v of vehicles) {
      await client.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (registration_number) DO NOTHING`,
        v,
      );
    }

    await client.query("COMMIT");

    console.log("Seed data inserted successfully!");
    console.log("");
    console.log("Admin credentials:");
    console.log("   Email:    admin@vehiclerental.com");
    console.log("   Password: admin123");
    console.log("");
    console.log("Customer credentials:");
    console.log("   Email:    selim@example.com");
    console.log("   Password: selim123");
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
