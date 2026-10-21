const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { auth } = require("../middleware");
const { validateUser, checkPassword } = require("../validators");

const router = express.Router();

// Normal user signup
router.post("/signup", async (req, res) => {
  const { name, email, address, password } = req.body;
  const error = validateUser({ name, email, address, password });
  if (error) return res.status(400).json({ message: error });

  try {
    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, hash, address || ""]
    );
    res.status(201).json({ message: "Signup successful. Please login." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Single login for all roles
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update password (any logged in user)
router.put("/password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const error = checkPassword(newPassword);
  if (error) return res.status(400).json({ message: error });

  try {
    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    if (!(await bcrypt.compare(oldPassword || "", rows[0].password_hash))) {
      return res.status(400).json({ message: "Old password is wrong" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
