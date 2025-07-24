import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@mui/material";

const ProfileDialog = ({ open, onClose, profile, title, onChangePassword }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle
      sx={{ textAlign: "center", fontWeight: 600, fontSize: "1.2rem" }}
    >
      {title}
    </DialogTitle>
    <DialogContent>
      {/* Candidate Profile */}
      {profile && profile.candidate_token ? (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>{profile.candidate_token}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>{profile.first_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Name</TableCell>
                <TableCell>{profile.last_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{profile.email_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone Number</TableCell>
                <TableCell>{profile.phone_number}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Applied Position</TableCell>
                <TableCell>{profile.applied_position}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Attendance Marked</TableCell>
                <TableCell>
                  {profile.attendance_marked ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Attendance Marked At</TableCell>
                <TableCell>
                  {profile.attendance_marked_at
                    ? new Date(profile.attendance_marked_at).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : profile && profile.employee_id ? (
        // Employee Profile (TA, TA Lead, Colleague)
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>{profile.employee_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>{profile.first_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Name</TableCell>
                <TableCell>{profile.last_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{profile.office_email_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>{profile.role}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Business Unit</TableCell>
                <TableCell>{profile.bu_name || profile.bu_id}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="error" align="center">
          Failed to load profile.
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
      {/* Show Change Password only for employees */}
      {profile && profile.employee_id && onChangePassword && (
        <Button
          variant="contained"
          color="primary"
          onClick={onChangePassword}
        >
          Change Password
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export default ProfileDialog;
