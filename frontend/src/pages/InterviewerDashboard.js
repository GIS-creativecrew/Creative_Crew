import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import { useAuth } from "../components/AuthContext";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ProfileDialog from "../components/ProfileDialog";
import { useNavigate } from "react-router-dom";

const InterviewerDashboard = () => {
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const [markedCandidates, setMarkedCandidates] = useState([]);
  const [editableRows, setEditableRows] = useState({});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [notification, setNotification] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Fetch scheduled interviews for this interviewer (panel member)
  const fetchScheduledInterviews = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/interviewer/scheduled-interviews?employee_id=${user.employee_id}`
      );
      setMarkedCandidates(res.data);

      const editState = {};
      res.data.forEach((c) => {
        editState[c.candidate_token] = {
          candidate_status: "",
          feedback_status: "",
          interview_status: c.status || "Scheduled",
        };
      });
      setEditableRows(editState);
    } catch (error) {
      setMarkedCandidates([]);
    }
  };

  useEffect(() => {
    if (!user || !user.employee_id) return; // <-- Add this guard
    fetchScheduledInterviews();
    // eslint-disable-next-line
  }, [user && user.employee_id]);

  const handleEditChange = (token, field, value) => {
    setEditableRows((prev) => ({
      ...prev,
      [token]: {
        ...prev[token],
        [field]: value,
      },
    }));
  };

  // Start/Finish Interview
  const handleStatusToggle = async (candidate) => {
    const currentStatus =
      editableRows[candidate.candidate_token]?.interview_status;
    let nextStatus;
    if (currentStatus === "Scheduled") nextStatus = "Started";
    else if (currentStatus === "Started") nextStatus = "Finished";
    else return; // Already finished

    try {
      await axios.post(`${BASE_URL}/api/interviewer/update-status`, {
        schedule_id: candidate.id,
        status: nextStatus,
      });
      setNotification(`Interview ${nextStatus} for ${candidate.first_name}`);
      setEditableRows((prev) => ({
        ...prev,
        [candidate.candidate_token]: {
          ...prev[candidate.candidate_token],
          interview_status: nextStatus,
        },
      }));
      fetchScheduledInterviews();
    } catch (err) {
      setNotification("Failed to update status");
    }
  };

  // Save feedback and status/result to interview_feedback (SEND TO TA)
  const handleSendFeedback = async () => {
    const feedbacks = markedCandidates.map((candidate) => ({
      candidate_token: candidate.candidate_token,
      interviewer_id: user.employee_id,
      scheduled_time: candidate.scheduled_time,
      room_no: candidate.room_no,
      interview_level: candidate.interview_level,
      interview_status:
        editableRows[candidate.candidate_token]?.interview_status || "",
      candidate_status:
        editableRows[candidate.candidate_token]?.candidate_status || "",
      feedback_status:
        editableRows[candidate.candidate_token]?.feedback_status || "",
      schedule_id: candidate.id,
    }));
    try {
      await axios.post(`${BASE_URL}/api/interviewer/send-feedback`, {
        feedbacks,
      });
      setFeedbackSent(true);
      setNotification("Feedback sent to TA successfully!");
      fetchScheduledInterviews();
    } catch (err) {
      setNotification("Failed to send feedback.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  // Handler for password dialog
  const handlePasswordDialogOpen = () => setShowPasswordDialog(true);
  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMsg("");
  };
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/api/employees/change-password`, {
        email: user.office_email_id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg("Password changed successfully!");
      setTimeout(handlePasswordDialogClose, 1200);
    } catch (err) {
      setPasswordMsg(
        err.response?.data?.message || "Failed to change password."
      );
    }
  };

  if (!user || !user.employee_id) {
    return <Typography sx={{ mt: 4, textAlign: "center" }}>Loading...</Typography>;
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <DashboardHeader
        title="Interviewer Dashboard"
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 4,
          pt: 2,
        }}
      >
        <IconButton color="primary">
          <NotificationsIcon />
        </IconButton>
      </Box>
      <Box sx={{ maxWidth: 950, mx: "auto", mt: 2 }}>
        <Typography
          variant="h6"
          color="black"
          fontFamily={"'Poppins', sans-serif"}
        >
          Welcome Interviewer! Here are your assigned interviews please provide
          your Feedback.
        </Typography>
        <br />
        <Paper sx={{ p: 3, mb: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr No.</TableCell>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Interview Level</TableCell>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Interview Status</TableCell>
                  <TableCell>Candidate Status</TableCell>
                  <TableCell>Feedback Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {markedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No scheduled interviews.
                    </TableCell>
                  </TableRow>
                ) : (
                  markedCandidates.map((candidate, idx) => {
                    const status =
                      editableRows[candidate.candidate_token]
                        ?.interview_status || "Scheduled";
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {candidate.first_name} {candidate.last_name}
                        </TableCell>
                        <TableCell>{candidate.interview_level}</TableCell>
                        <TableCell>
                          {candidate.scheduled_time
                            ? new Date(
                                candidate.scheduled_time
                              ).toLocaleString()
                            : ""}
                        </TableCell>
                        <TableCell>{candidate.room_no || ""}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color={
                              status === "Started"
                                ? "success"
                                : status === "Finished"
                                ? "secondary"
                                : "primary"
                            }
                            size="small"
                            onClick={() => handleStatusToggle(candidate)}
                            disabled={feedbackSent || status === "Finished"}
                          >
                            {status === "Scheduled"
                              ? "Start"
                              : status === "Started"
                              ? "Finish"
                              : "Finished"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              editableRows[candidate.candidate_token]
                                ?.candidate_status || ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                candidate.candidate_token,
                                "candidate_status",
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth
                            disabled={feedbackSent}
                          >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Selected">Selected</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="On hold">On hold</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={
                              editableRows[candidate.candidate_token]
                                ?.feedback_status || ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                candidate.candidate_token,
                                "feedback_status",
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth
                            placeholder="Enter feedback status"
                            disabled={feedbackSent}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
            onClick={handleSendFeedback}
            disabled={feedbackSent}
          >
            SEND TO TA
          </Button>
          <Snackbar
            open={!!notification}
            autoHideDuration={3000}
            onClose={() => setNotification("")}
            message={notification}
          />
        </Paper>
      </Box>
      <ProfileDialog
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profile={user}
        title="Interviewer Profile"
        onChangePassword={handlePasswordDialogOpen}
      />
      <Dialog
        open={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              label="Old Password"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              required
            />
            <Typography
              color={passwordMsg.includes("success") ? "success.main" : "error"}
              sx={{ mt: 1 }}
            >
              {passwordMsg}
            </Typography>
            <DialogActions>
              <Button onClick={handlePasswordDialogClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ background: "green" }}
              >
                Change Password
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InterviewerDashboard;
