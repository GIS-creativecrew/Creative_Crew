const pool = require("../config/db");

const assignToBU = async (req, res) => {
  const { assignments, assigned_by } = req.body;
  if (!assignments || !Array.isArray(assignments) || !assigned_by) {
    return res.status(400).json({ message: "Invalid data" });
  }
  try {
    // Check assigned_by is TA Lead
    const empRes = await pool.query(
      "SELECT role, bu_id FROM employee_info WHERE employee_id = $1",
      [assigned_by]
    );
    if (!empRes.rows.length || empRes.rows[0].role !== "TA Lead") {
      return res.status(403).json({ message: "Only TA Lead can assign Husky IDs" });
    }
    let inserted = 0,
      skipped = 0;
    for (const a of assignments) {
      // Validate Husky ID belongs to BU
      // (If you have a master Husky ID table, check here)
      // Check if already exists
      const exists = await pool.query(
        "SELECT 1 FROM bu_husky_ids WHERE bu_id = $1 AND husky_id = $2",
        [a.bu_id, a.husky_id]
      );
      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }
      await pool.query(
        "INSERT INTO bu_husky_ids (bu_id, husky_id, assigned_by) VALUES ($1, $2, $3)",
        [a.bu_id, a.husky_id, assigned_by]
      );
      inserted++;
    }
    res.json({
      message: `Assignments saved. Inserted: ${inserted}, Skipped (already assigned): ${skipped}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssigned = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT bu_id, husky_id FROM bu_husky_ids"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { assignToBU, getAssigned };