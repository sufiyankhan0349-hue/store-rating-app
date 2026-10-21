const express = require("express");
const db = require("../db");
const { auth, allow } = require("../middleware");
const { orderBy } = require("../validators");

const router = express.Router();
router.use(auth, allow("owner"));

// Owner dashboard: average rating + users who rated the store
router.get("/dashboard", async (req, res) => {
  try {
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.address, ROUND(AVG(r.rating), 1) AS "averageRating"
       FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ? GROUP BY s.id`,
      [req.user.id]
    );

    const result = [];
    for (const store of stores) {
      const [raters] = await db.query(
        `SELECT u.name, u.email, r.rating
         FROM ratings r JOIN users u ON u.id = r.user_id
         WHERE r.store_id = ?
         ${orderBy(req.query, ["name", "email", "rating"], "name")}`,
        [store.id]
      );
      result.push({ ...store, raters });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
