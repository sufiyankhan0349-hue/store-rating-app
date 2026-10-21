// Run once: npm run seed  -> creates the first admin user
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

async function seed() {
  const email = "admin@example.com";
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length) {
    console.log("Admin already exists");
  } else {
    const hash = await bcrypt.hash("Admin@123", 10);
    await db.query(
      "INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, 'admin')",
      ["System Administrator Account", email, hash, "Head Office"]
    );
    console.log("Admin created -> email: admin@example.com  password: Admin@123");
  }
  process.exit();
}

seed();
