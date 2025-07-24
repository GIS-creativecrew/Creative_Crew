import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  createTheme,
  ThemeProvider,
} from "@mui/material";

const ROLE_OPTIONS = ["Colleague"]; // Only allow Colleague for self-signup

const SignUpForm = () => {
  const [form, setForm] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    office_email_id: "",
    password: "",
    bu_id: "",
    role: "Colleague", // Default to Colleague
  });
  const [buOptions, setBuOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BASE_URL}/api/bu/list`).then((res) => setBuOptions(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/employees/signup`, form);
      setMessage("Signup successful! Please login to continue.");
      setMessageColor("success");
      setForm({
        employee_id: "",
        first_name: "",
        last_name: "",
        office_email_id: "",
        password: "",
        bu_id: "",
        role: "Colleague",
      });
      setShowLogin(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
      setMessageColor("error");
    }
  };

  const theme = createTheme({
    components: {
      MuiInputLabel: {
        styleOverrides: {
          asterisk: {
            color: "red",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        component={Paper}
        elevation={3}
        sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          fontWeight={600}
          sx={{
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'sans-serif'",
            letterSpacing: 1,
            color: "#303031ff",
          }}
        >
          Employee Registration
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Employee ID"
            name="employee_id"
            value={form.employee_id}
            onChange={(e) => {
              // Only allow up to 7 digits, numbers only
              const val = e.target.value.replace(/\D/g, "").slice(0, 7);
              setForm({ ...form, employee_id: val });
            }}
            fullWidth
            margin="normal"
            required
            inputProps={{
              maxLength: 7,
              inputMode: "numeric",
              pattern: "\\d{1,7}",
            }}
          />
          <TextField
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Office Email"
            name="office_email_id"
            type="email"
            value={form.office_email_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Set Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required>
            {ROLE_OPTIONS.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Business Unit"
            name="bu_id"
            value={form.bu_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required>
            {buOptions.map((bu) => (
              <MenuItem key={bu.id} value={bu.id}>
                {bu.name}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              flexDirection: { xs: "column", sm: "row" },
              gap: 2, // Add gap between buttons
            }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "green",
                color: "#fff",
                border: "2px solid green",
                textTransform: "none", // Prevent all caps
                fontSize: "1.05rem",
                height: 40,
                "&:hover": {
                  backgroundColor: "#228B22",
                  borderColor: "#228B22",
                },
                flex: 1,
              }}>
              Sign Up
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: "green",
                color: "#fff",
                border: "2px solid green",
                textTransform: "none",
                fontSize: "1.05rem",
                height: 40,

                "&:hover": {
                  backgroundColor: "#228B22",
                  borderColor: "#228B22",
                },
                flex: 1,
              }}>
              Login
            </Button>
          </Box>
          <Typography
            color={messageColor === "success" ? "success.main" : "error"}
            sx={{ mt: 2, textAlign: "center" }}>
            {message}
          </Typography>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default SignUpForm;
