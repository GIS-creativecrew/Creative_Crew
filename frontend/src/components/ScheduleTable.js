import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../utils/baseurl";

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/ta/schedules`)
      .then((res) => setSchedules(res.data));
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Interview Schedule
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Interview Level</TableCell>
              <TableCell>Panel</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Interview Status</TableCell>
              <TableCell>Candidate Status</TableCell>
              <TableCell>Interviewer Feedback</TableCell>
              <TableCell>Candidate Feedback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((s, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {s.first_name} {s.last_name}
                </TableCell>
                <TableCell>{s.interview_level}</TableCell>
                <TableCell>{s.panel_name}</TableCell>
                <TableCell>{s.meeting_room_number}</TableCell>
                <TableCell>
                  {new Date(s.scheduled_time).toLocaleString()}
                </TableCell>
                <TableCell>{s.status || "-"}</TableCell>
                <TableCell>{s.result || "-"}</TableCell>
                <TableCell>{s.interviewer_feedback || "-"}</TableCell>
                <TableCell>{s.candidate_feedback || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ScheduleTable;
