import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Button, Stack, Modal
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import TAPanelTableScheduleInteviews from "./TAPanelTableScheduleInteviews"; // Make sure spelling matches your file!

const TADrivePanelTable = () => {
  const [rows, setRows] = useState([]);
  const [maxPanelRounds, setMaxPanelRounds] = useState(2);
  const [filters, setFilters] = useState({
    bu: "",
    drive_name: "",
    husky_id: "",
    country: "",
    state: "",
    city: "",
    building: "",
    date: "",
  });

  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [selectedScheduleData, setSelectedScheduleData] = useState(null);

  // Fetch table data
  const fetchTable = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    const res = await axios.get(`${BASE_URL}/api/ta/table-view?${params.toString()}`);
    setRows(res.data.rows || []);
    setMaxPanelRounds(res.data.max_panel_rounds || 2);
  };

  useEffect(() => { fetchTable(); }, []);

  // Log sample row after fetching
  useEffect(() => {
    if (rows.length > 0) {
      console.log("Sample row:", rows[0]);
    }
  }, [rows]);

  // Unique values for filters
  const unique = (key) => [...new Set(rows.map(r => r[key]).filter(Boolean))];

  // Unique drives for selected BU
  const uniqueDrives = () => {
    let filteredRows = rows;
    if (filters.bu) {
      filteredRows = rows.filter(r => r.bu === filters.bu);
    }
    return [...new Set(filteredRows.map(r => r.drive_name).filter(Boolean))];
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => fetchTable();

  // Helper to render dynamic panel columns (headers)
  const renderPanelHeaders = () => {
    const headers = [];
    for (let i = 1; i <= maxPanelRounds; i++) {
      headers.push(
        <TableCell key={`panel${i}`} sx={{ fontWeight: 700 }}>{`L${i} Panel`}</TableCell>
      );
      headers.push(
        <TableCell key={`slot${i}`} sx={{ fontWeight: 700 }}>{`L${i} Slot`}</TableCell>
      );
      headers.push(
        <TableCell key={`candidate${i}`} sx={{ fontWeight: 700 }}>{`Candidate`}</TableCell>
      );
      headers.push(
        <TableCell key={`status${i}`} sx={{ fontWeight: 700 }}>{`L${i} Status`}</TableCell>
      );
      headers.push(
        <TableCell key={`feedback${i}`} sx={{ fontWeight: 700 }}>{`Feedback`}</TableCell>
      );
      headers.push(
        <TableCell key={`action${i}`} sx={{ fontWeight: 700 }}>{`Action`}</TableCell>
      ); // <-- Action column after each round's feedback
    }
    return headers;
  };

  // Helper to render dynamic panel cells (rows)
  const renderPanelCells = (row) => {
    const cells = [];
    for (let i = 1; i <= maxPanelRounds; i++) {
      cells.push(<TableCell key={`panel${i}`}>{row[`l${i}_panel`]}</TableCell>);
      cells.push(
        <TableCell key={`slot${i}`}>
          {row[`l${i}_slot`] ? new Date(row[`l${i}_slot`]).toLocaleString() : ""}
        </TableCell>
      );
      cells.push(<TableCell key={`candidate${i}`}>{row[`l${i}_candidate`]}</TableCell>);
      cells.push(<TableCell key={`status${i}`}>{row[`l${i}_status`]}</TableCell>);
      cells.push(<TableCell key={`feedback${i}`}>{row[`l${i}_feedback`]}</TableCell>);
      // Show button only if status and feedback exist for this round
      const hasStatus = !!row[`l${i}_status`];
      const hasFeedback = !!row[`l${i}_feedback`];
      cells.push(
        <TableCell key={`action${i}`}>
          {hasStatus && hasFeedback ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setSelectedScheduleData({
                  drive: row.drive_name || row.drive || row.name,
                  candidate_token: row.candidate_token, // <-- pass candidate_token from row
                  round: i,
                  // Add other info if needed
                });
                setOpenScheduleModal(true);
              }}
            >
              Schedule Next Interview
            </Button>
          ) : null}
        </TableCell>
      );
    }
    return cells;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fafbfc",
        px: { xs: 1, sm: 3, md: 6, lg: 10 }, // Reduced horizontal margin
        py: { xs: 1, md: 2 }, // Reduced vertical margin
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: "#1976d2",
          letterSpacing: 1,
        }}
      >
        Drives & Interviews Table View
      </Typography>
      {/* Show which drive is being filtered */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#1976d2" }}>
          {filters.drive_name
            ? `Showing results for Drive: ${filters.drive_name}${filters.bu ? ` (BU: ${filters.bu})` : ""}`
            : filters.bu
            ? `Showing results for BU: ${filters.bu}`
            : "Showing all Drives & BUs"}
        </Typography>
      </Box>
      <Paper sx={{ p: 2, mb: 3, width: "100%", maxWidth: 1400, mx: "auto" }}>
        {/* Center filters and make horizontally scrollable if needed */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start", // Align filters to the left
            overflowX: "auto",
            minHeight: 100,
            pl: 2, // Add left padding for extra space
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="nowrap"
            justifyContent="flex-start" // Align filters to the left
            sx={{
              minWidth: 1400,
              pb: 1,
            }}
          >
            <TextField
              select
              label="BU"
              name="bu"
              value={filters.bu}
              onChange={handleFilterChange}
              sx={{
                minWidth: 150, // Increase width for BU field
                height: 56,
                "& .MuiInputBase-root": { height: 56 },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {unique("bu").map((v) => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </TextField>
            {/* Drive filter: always visible, but only shows options for selected BU */}
            <TextField
              select
              label="Drive"
              name="drive_name"
              value={filters.drive_name || ""}
              onChange={handleFilterChange}
              sx={{ minWidth: 140 }}
              // Do NOT disable the Drive filter, just show empty if no BU
            >
              <MenuItem value="">All</MenuItem>
              {filters.bu
                ? uniqueDrives().map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))
                : null}
            </TextField>
            <TextField select label="HuskyID" name="husky_id" value={filters.husky_id} onChange={handleFilterChange} sx={{ minWidth: 120 }}>
              <MenuItem value="">All</MenuItem>
              {unique("husky_id").map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField select label="Country" name="country" value={filters.country} onChange={handleFilterChange} sx={{ minWidth: 120 }}>
              <MenuItem value="">All</MenuItem>
              {unique("country").map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField select label="State" name="state" value={filters.state} onChange={handleFilterChange} sx={{ minWidth: 120 }}>
              <MenuItem value="">All</MenuItem>
              {unique("state").map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField select label="City" name="city" value={filters.city} onChange={handleFilterChange} sx={{ minWidth: 120 }}>
              <MenuItem value="">All</MenuItem>
              {unique("city").map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField select label="Building" name="building" value={filters.building} onChange={handleFilterChange} sx={{ minWidth: 120 }}>
              <MenuItem value="">All</MenuItem>
              {unique("building").map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={filters.date}
              onChange={handleFilterChange}
              sx={{ minWidth: 140 }}
            />
            <Button variant="contained" color="primary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Paper
        sx={{
          p: 2,
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          boxShadow: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
            p: 0,
            m: 0,
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 1200,
              width: "max-content",
              borderCollapse: "separate",
              borderSpacing: 0,
              background: "#fff",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>BU</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>Drive</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>HuskyID</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>State</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>City</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>Room no</TableCell>
                <TableCell sx={{ fontWeight: 700, border: "1px solid #e0e0e0", background: "#f7f7f7" }}>Date</TableCell>
                {renderPanelHeaders().map((cell, idx) =>
                  React.cloneElement(cell, {
                    sx: { ...cell.props.sx, border: "1px solid #e0e0e0", background: "#f7f7f7" },
                    key: idx,
                  })
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9 + maxPanelRounds * 6} align="center" sx={{ border: "1px solid #e0e0e0" }}>
                    No data found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 500, border: "1px solid #e0e0e0" }}>{r.bu}</TableCell>
                    <TableCell sx={{ fontWeight: 500, border: "1px solid #e0e0e0" }}>
                      {r.drive_name || r.drive || r.name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, border: "1px solid #e0e0e0" }}>{r.husky_id}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>{r.country}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>{r.state}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>{r.city}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>{r.building}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>{r.room_no}</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>
                      {r.date ? new Date(r.date).toLocaleDateString() : ""}
                    </TableCell>
                    {renderPanelCells(r).map((cell, i) =>
                      React.cloneElement(cell, { sx: { border: "1px solid #e0e0e0" }, key: i })
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Modal for scheduling interviews */}
      <Modal
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        aria-labelledby="schedule-modal-title"
        aria-describedby="schedule-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          minWidth: 400,
          borderRadius: 2,
        }}>
          <TAPanelTableScheduleInteviews
            onClose={() => setOpenScheduleModal(false)}
            scheduleData={selectedScheduleData} // Pass selected data as prop
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default TADrivePanelTable;