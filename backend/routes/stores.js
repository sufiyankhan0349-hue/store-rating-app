const express = require("express");
const db = require("../db");
const { auth, allow } = require("../middleware");
const { orderBy } = require("../validators");

const router = express.Router();
router.use(auth, allow("user"));

// All stores with overall rating and this user's rating. Search by name / address.
router.get("/", async (req, res) => {
  const { name = "", address = "" } = req.query;
  const sql = `
    SELECT s.id, s.name, s.address,
      ROUND(AVG(r.rating), 1) AS "overallRating",
      (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?::int) AS "myRating"
    FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name ILIKE ? AND s.address ILIKE ?
    GROUP BY s.id
    ${orderBy(req.query, ["name", "address", "overallRating"], "name")}`;
  try {
    const [rows] = await db.query(sql, [req.user.id, `%${name}%`, `%${address}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit or modify rating (one rating per user per store)
router.post("/:id/rating", async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  try {
    const [store] = await db.query("SELECT id FROM stores WHERE id = ?", [req.params.id]);
    if (!store.length) return res.status(404).json({ message: "Store not found" });

    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, req.params.id, rating]
    );
    res.json({ message: "Rating saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
