const Employee = require("../models/signupModels");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const signupEmployee = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.office_email_id || !req.body.office_email_id.endsWith("@company.com")) {
      return res.status(400).json({ message: "Email must be a @company.com address" });
    }
    if (!/^\d{1,7}$/.test(req.body.employee_id)) {
      return res.status(400).json({ message: "Employee ID must be a number up to 7 digits." });
    }
    if (!req.body.bu_id) {
      return res.status(400).json({ message: "Business Unit is required." });
    }
    const employee = await Employee.createEmployee(req.body); // req.body.role included
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const result = await pool.query(
      `SELECT e.*, b.name AS bu_name
       FROM employee_info e
       LEFT JOIN business_units b ON e.bu_id = b.id
       WHERE e.office_email_id = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    // Get user by email
    const userRes = await pool.query(
      "SELECT * FROM employee_info WHERE office_email_id = $1",
      [email]
    );
    if (!userRes.rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    const user = userRes.rows[0];
    // Check old password
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }
    // Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE employee_info SET password = $1 WHERE office_email_id = $2",
      [hashed, email]
    );
    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signupEmployee, changePassword, getProfile };
