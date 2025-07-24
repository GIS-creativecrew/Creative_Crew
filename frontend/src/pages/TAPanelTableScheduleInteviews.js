import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../utils/baseurl";

const ManualScheduleForm = ({ scheduleData }) => {
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [panels, setPanels] = useState([]);
  const [form, setForm] = useState({
    candidate_token: "",
    round: "",
    interviewer_id: "",
    panel_id: "",
    room_id: "",
    scheduled_time: "",
    drive_id: "",
  });
  const [message, setMessage] = useState("");
  const [drives, setDrives] = useState([]);
  const [selectedDriveRounds, setSelectedDriveRounds] = useState([]);
  const [filteredPanels, setFilteredPanels] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/ta/candidates-for-scheduling`)
      .then((res) => setCandidates(res.data));
    axios
      .get(`${BASE_URL}/api/ta/interviewers`)
      .then((res) => setInterviewers(res.data));
    axios.get(`${BASE_URL}/api/ta/rooms`).then((res) => setRooms(res.data));
    axios.get(`${BASE_URL}/api/ta/panels/all`).then((res) => setPanels(res.data));
    axios.get(`${BASE_URL}/api/ta/drives/all`).then((res) => setDrives(res.data));

  }, []);

  // Add this effect to prepopulate drive and candidate when scheduleData changes
  useEffect(() => {
    if (scheduleData && drives.length && candidates.length) {
      // Find drive_id from drive name or id
      let driveId = "";
      if (scheduleData.drive) {
        const foundDrive = drives.find(
          (d) =>
            d.drive_name === scheduleData.drive ||
            d.drive_id === scheduleData.drive
        );
        driveId = foundDrive ? foundDrive.drive_id : "";
      }
      // Find candidate_token from husky_id or token
      let candidateToken = "";
      if (scheduleData.candidate) {
        const foundCandidate = candidates.find(
          (c) =>
            c.husky_id === scheduleData.candidate ||
            c.candidate_token === scheduleData.candidate
        );
        candidateToken = foundCandidate ? foundCandidate.candidate_token : "";
      }
      setForm((prev) => ({
        ...prev,
        drive_id: driveId,
        candidate_token: candidateToken,
      }));
    }
  }, [scheduleData, drives, candidates]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "drive_id") {
      const selectedDrive = drives.find((d) => d.drive_id === parseInt(value));
      if (selectedDrive) {
        const rounds = Array.from(
          { length: selectedDrive.no_of_panel_rounds },
          (_, i) => `L${i + 1}`
        );
        setSelectedDriveRounds(rounds);
      } else {
        setSelectedDriveRounds([]);
      }

      setFilteredPanels([]);
      setForm((prev) => ({
        ...prev,
        drive_id: value,
        round: "",
        panel_id: "",
        room_id: "",
      }));
    }

    else if (name === "round") {
      setForm((prev) => ({
        ...prev,
        round: value,
        panel_id: "",
        room_id: "",
      }));

      // Now interview_level is a string like "L2"
      const matchingPanels = panels.filter((panel) => {
        return panel.interview_level === value;
      });

      setFilteredPanels(matchingPanels);
    }

    else if (name === "panel_id") {
      const selectedPanel = panels.find((p) => p.id === parseInt(value));
      setForm((prev) => ({
        ...prev,
        panel_id: value,
        room_id: selectedPanel ? selectedPanel.interview_room_id : "",
      }));
    }

    else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  console.log("Form data:", form);
  const payload = {
    candidate_token: form.candidate_token,
    interview_level: form.round, // renamed from round to interview_level
    panel_id: form.panel_id,
    room_id: form.room_id,
    scheduled_time: form.scheduled_time,
    drive_id: form.drive_id,
  };

  try {
    await axios.post(`${BASE_URL}/api/ta/manual-schedule`, payload);
    setMessage("Interview scheduled successfully.");
  } catch (err) {
    setMessage(err.response?.data?.message || "Scheduling failed.");
  }
};

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Manual Schedule
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Drive"
          name="drive_id"
          value={form.drive_id}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {drives.map((drive) => (
            <MenuItem key={drive.drive_id} value={drive.drive_id}>
              {drive.drive_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Candidate"
          name="candidate_token"
          value={form.candidate_token}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {candidates.map((c) => (
            <MenuItem key={c.candidate_token} value={c.candidate_token}>
              {c.first_name} {c.last_name}
            </MenuItem>
          ))}
        </TextField>
        {/* rounds */}

        <TextField
          select
          label="Round"
          name="round"
          value={form.round}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={selectedDriveRounds.length === 0}
        >
          <MenuItem value="">Select Round</MenuItem>
          {selectedDriveRounds.map((round) => (
            <MenuItem key={round} value={round}>
              {round}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Panel"
          name="panel_id"
          value={form.panel_id}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={filteredPanels.length === 0}
        >
          {filteredPanels.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.panel_name} {p.meeting_room_number ? `(${p.meeting_room_number})` : "(No Room)"}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Room"
          name="room_id"
          value={form.room_id}
          fullWidth
          margin="normal"
          required
          disabled // ← this disables user edits
        >
          {rooms.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.meeting_room_number}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Schedule Time"
          name="scheduled_time"
          type="datetime-local"
          value={form.scheduled_time}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
            },
          }}
        />

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Schedule
        </Button>
        <Typography color="error" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </form>
    </Paper>
  );
};

export default ManualScheduleForm;
