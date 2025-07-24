import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

const CandidateRegistrationForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email_id: "",
    phone_number: "",
    applied_position: "",
  });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post(`${BASE_URL}/api/candidates/register`, form);
      setMessage("Candidate registered successfully!");
      setMessageColor("success");
      setForm({
        first_name: "",
        last_name: "",
        email_id: "",
        phone_number: "",
        applied_position: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageColor("error");
    }
  };

  return (
    <Box component={Paper} sx={{ p: 3, mb: 2, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h6" gutterBottom align="center" fontWeight={600}>
        Register Candidate
      </Typography>
      <form onSubmit={handleSubmit}>
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
          label="Email"
          name="email_id"
          type="email"
          value={form.email_id}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Phone Number"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Applied Position"
          name="applied_position"
          value={form.applied_position}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: "green", mt: 2 }}
          fullWidth
        >
          Register
        </Button>
        <Typography color={messageColor} sx={{ mt: 2, textAlign: "center" }}>
          {message}
        </Typography>
      </form>
    </Box>
  );
};

export default CandidateRegistrationForm;
