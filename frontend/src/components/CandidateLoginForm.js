import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// ✅ Styled textfield to show red asterisk for required fields
const RedAsteriskTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "black",
  },
  "& .MuiInputLabel-asterisk": {
    color: "red",
  },
});

const CandidateLoginForm = () => {
  const [form, setForm] = useState({
    email_id: "",
    phone_number: "",
    candidate_token: "",
  });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/api/candidates/login`, form);
      localStorage.setItem("candidate", JSON.stringify(res.data.candidate));
      setMessage("Login successful!");
      setMessageColor("success");
      setTimeout(() => {
        navigate("/dashboard/candidate");
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setMessageColor("error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#8de883", // ✅ Full green background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component={Paper}
        elevation={3}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h2"
          align="center"
          fontWeight={550}
          fontSize="1.5rem"
          gutterBottom
        >
          Candidate Attendance
        </Typography>
        <form onSubmit={handleSubmit}>
          <RedAsteriskTextField
            label="Email"
            name="email_id"
            type="email"
            value={form.email_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <RedAsteriskTextField
            label="Phone Number"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <RedAsteriskTextField
            label="Token"
            name="candidate_token"
            value={form.candidate_token}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "green",
              mt: 2,
              textTransform: "none", // ✅ Not in capital letters
            }}
            fullWidth
          >
            Mark Attendance
          </Button>
          <Typography color={messageColor} sx={{ mt: 2, textAlign: "center" }}>
            {message}
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default CandidateLoginForm;
