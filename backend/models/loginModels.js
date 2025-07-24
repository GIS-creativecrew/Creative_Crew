const pool = require("../config/db");

const findEmployeeByEmail = async (email) => {
  const query = `
    SELECT e.*, b.name AS bu_name
    FROM employee_info e
    LEFT JOIN business_units b ON e.bu_id = b.id
    WHERE e.office_email_id = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

module.exports = { findEmployeeByEmail };
