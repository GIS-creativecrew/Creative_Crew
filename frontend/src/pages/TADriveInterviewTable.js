import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../utils/baseurl";

const statusOptions = [
  "All",
  "Scheduled",
  "Completed",
  "Cancelled",
];

const modeOptions = [
  "All",
  "Physical",
  "Virtual",
];

const TADriveInterviewTable = () => {
  const [drives, setDrives] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    building: "",
    status: "All",
    mode_of_interview: "All",
    from: "",
    to: "",
  });
  const [locationOptions, setLocationOptions] = useState({
    country: [],
    state: [],
    city: [],
    building: [],
  });

  // Fetch location options for filters
  useEffect(() => {
    axios.get(`${BASE_URL}/api/ta/drive-locations`)
      .then(res => setLocationOptions(res.data))
      .catch(() => setLocationOptions({
        country: [],
        state: [],
        city: [],
        building: [],
      }));
  }, []);

  // Fetch drives/interviews with filters
  const fetchDrives = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "All") params.append(key, value);
    });
    const res = await axios.get(`${BASE_URL}/api/ta/drives?${params.toString()}`);
    setDrives(res.data);
  };

  useEffect(() => {
    fetchDrives();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchDrives();
  };

  const handleClearFilters = () => {
    setFilters({
      country: "",
      state: "",
      city: "",
      building: "",
      status: "All",
      mode_of_interview: "All",
      from: "",
      to: "",
    });
    setTimeout(fetchDrives, 0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fafbfc",
        px: { xs: 2, sm: 6, md: 12, lg: 20 }, // horizontal padding for all screens
        py: { xs: 2, md: 4 }, // vertical padding
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Drives & Interviews Overview
      </Typography>
      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          mb: 3,
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          boxSizing: "border-box",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            select
            label="Country"
            name="country"
            value={filters.country}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {locationOptions.country.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="State"
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {locationOptions.state.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="City"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {locationOptions.city.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Building"
            name="building"
            value={filters.building}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {locationOptions.building.map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Mode"
            name="mode_of_interview"
            value={filters.mode_of_interview}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            {modeOptions.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="From"
            name="from"
            InputLabelProps={{ shrink: true }}
            value={filters.from}
            onChange={handleFilterChange}
            sx={{ minWidth: 140 }}
          />
          <TextField
            type="date"
            label="To"
            name="to"
            InputLabelProps={{ shrink: true }}
            value={filters.to}
            onChange={handleFilterChange}
            sx={{ minWidth: 140 }}
          />
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
            Clear
          </Button>
        </Stack>
      </Paper>
      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          boxSizing: "border-box",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Drive Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>State</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Building</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Openings</TableCell>
                <TableCell>Panel Rounds</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No drives/interviews found.
                  </TableCell>
                </TableRow>
              ) : (
                drives.map((d) => (
                  <TableRow key={d.drive_id}>
                    <TableCell>{d.drive_name}</TableCell>
                    <TableCell>{d.drive_date}</TableCell>
                    <TableCell>{d.mode_of_interview}</TableCell>
                    <TableCell>{d.country}</TableCell>
                    <TableCell>{d.state}</TableCell>
                    <TableCell>{d.city}</TableCell>
                    <TableCell>{d.building}</TableCell>
                    <TableCell>{d.status || "Scheduled"}</TableCell>
                    <TableCell>{d.no_of_openings}</TableCell>
                    <TableCell>{d.no_of_panel_rounds}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TADriveInterviewTable;