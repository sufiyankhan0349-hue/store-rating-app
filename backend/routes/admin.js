const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { auth, allow } = require("../middleware");
const { validateUser, checkName, checkEmail, checkAddress, orderBy } = require("../validators");

const router = express.Router();
router.use(auth, allow("admin"));

// Dashboard numbers
router.get("/stats", async (req, res) => {
  try {
    const [[u]] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [[s]] = await db.query("SELECT COUNT(*) AS total FROM stores");
    const [[r]] = await db.query("SELECT COUNT(*) AS total FROM ratings");
    res.json({ users: u.total, stores: s.total, ratings: r.total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add user (normal, admin or store owner)
router.post("/users", async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const error = validateUser({ name, email, address, password });
  if (error) return res.status(400).json({ message: error });
  if (!["admin", "user", "owner"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, address || "", role]
    );
    res.status(201).json({ message: "User added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add store (optionally linked to a store owner)
router.post("/stores", async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const error = checkName(name) || checkEmail(email) || checkAddress(address);
  if (error) return res.status(400).json({ message: error });

  try {
    if (ownerId) {
      const [owner] = await db.query("SELECT id FROM users WHERE id = ? AND role = 'owner'", [ownerId]);
      if (!owner.length) return res.status(400).json({ message: "Owner not found" });
    }
    const [exists] = await db.query("SELECT id FROM stores WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "Store email already exists" });

    await db.query("INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)", [
      name,
      email,
      address || "",
      ownerId || null,
    ]);
    res.status(201).json({ message: "Store added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// List users with filters + sorting
router.get("/users", async (req, res) => {
  const { name = "", email = "", address = "", role = "" } = req.query;
  const sql = `
    SELECT u.id, u.name, u.email, u.address, u.role,
      (SELECT ROUND(AVG(r.rating), 1) FROM stores s
        JOIN ratings r ON r.store_id = s.id WHERE s.owner_id = u.id) AS rating
    FROM users u
    WHERE u.name ILIKE ? AND u.email ILIKE ? AND u.address ILIKE ? AND (?::text = '' OR u.role = ?::text)
    ${orderBy(req.query, ["name", "email", "address", "role"], "name")}`;
  try {
    const [rows] = await db.query(sql, [`%${name}%`, `%${email}%`, `%${address}%`, role, role]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Single user details
router.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
        (SELECT ROUND(AVG(r.rating), 1) FROM stores s
          JOIN ratings r ON r.store_id = s.id WHERE s.owner_id = u.id) AS rating
       FROM users u WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// List stores with filters + sorting
router.get("/stores", async (req, res) => {
  const { name = "", email = "", address = "" } = req.query;
  const sql = `
    SELECT s.id, s.name, s.email, s.address, ROUND(AVG(r.rating), 1) AS rating
    FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name ILIKE ? AND s.email ILIKE ? AND s.address ILIKE ?
    GROUP BY s.id
    ${orderBy(req.query, ["name", "email", "address", "rating"], "name")}`;
  try {
    const [rows] = await db.query(sql, [`%${name}%`, `%${email}%`, `%${address}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
