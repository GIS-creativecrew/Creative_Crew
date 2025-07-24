const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findEmployeeByEmail } = require("../models/loginModels");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const employee = await findEmployeeByEmail(email);
    if (employee && (await bcrypt.compare(password, employee.password))) {
      // Create JWT
      const payload = {
        employee_id: employee.employee_id,
        office_email_id: employee.office_email_id,
        role: employee.role,
        bu_id: employee.bu_id,
        bu_name: employee.bu_name,
        first_name: employee.first_name,
        last_name: employee.last_name,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
      return res.status(200).json({
        message: "Login successful",
        user: payload,
        token,
      });
    }
    return res.status(401).json({ message: "Invalid credentials." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser };
