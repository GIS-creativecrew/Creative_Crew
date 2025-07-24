import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { useAuth } from "./AuthContext";

// Add theme for red asterisk
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

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setShowRegister(false);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      if (res.data.user) {
        setUser(res.data.user);
        setToken(res.data.token);

        // Redirect based on role (from backend user object)
        if (res.data.user.role === "TA Lead") {
          navigate("/dashboard/talead");
        } else if (res.data.user.role === "TA") {
          navigate("/dashboard/ta");
        } else {
          navigate("/dashboard/interviewer");
        }
      } else {
        setMessage("Login failed.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        component={Paper}
        elevation={3}
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 8,
          p: 4,
        }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          fontWeight={600}
          sx={{
            fontFamily:
              "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'sans-serif'",
            letterSpacing: 1,
            color: "#303031ff",
          }}>
          {" "}
          Employee Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Office Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "green",
                color: "#fff",
                border: "2px solid green",
                fontSize: "1.05rem",
                py: 0.3,
                flex: 1,
                mr: 1,
                textTransform: "none", // Prevent all caps
                "&:hover": {
                  backgroundColor: "#228B22",
                  borderColor: "#228B22",
                },
              }}>
              Login
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => navigate("/register")}
              sx={{
                backgroundColor: "green",
                color: "#fff",
                border: "2px solid green",
                fontSize: "1.05rem",
                py: 0.3,
                flex: 1,
                ml: 1,
                textTransform: "none", // Prevent all caps
                "&:hover": {
                  backgroundColor: "#228B22",
                  borderColor: "#228B22",
                },
              }}>
              Sign Up
            </Button>
          </Box>
          <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
            {message}
          </Typography>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default LoginForm;
