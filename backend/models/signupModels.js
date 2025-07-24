const pool = require("../config/db");
const bcrypt = require("bcrypt");

const createEmployee = async (employee) => {
  const {
    employee_id,
    first_name,
    last_name,
    office_email_id,
    role,
    password,
    bu_id,
  } = employee;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO employee_info (employee_id, first_name, last_name, office_email_id, role, password, bu_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    employee_id,
    first_name,
    last_name,
    office_email_id,
    role,
    hashedPassword,
    bu_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createEmployee };
