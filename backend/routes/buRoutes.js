const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM business_units ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
