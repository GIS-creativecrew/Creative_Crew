import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  Snackbar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Avatar,
} from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import ProfileDialog from "../components/ProfileDialog";
import { useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  const candidate = JSON.parse(localStorage.getItem("candidate"));
  const name = candidate
    ? `${candidate.first_name} ${candidate.last_name}`
    : "Candidate";

  const handleProfileOpen = () => setShowProfile(true);

  useEffect(() => {
    if (candidate && candidate.candidate_token) {
      axios
        .get(
          `${BASE_URL}/api/candidates/profile?token=${candidate.candidate_token}`
        )
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null));
      axios
        .get(
          `${BASE_URL}/api/candidates/interviews?token=${candidate.candidate_token}`
        )
        .then((res) => setInterviews(res.data));
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [candidate]);

  const fetchNotifications = async () => {
    const res = await axios.get(
      `${BASE_URL}/api/candidates/notifications?token=${candidate.candidate_token}`
    );
    setNotifications(res.data);
    setNotificationCount(res.data.filter((n) => !n.read).length);
  };

  const handleNotificationClick = async () => {
    setShowNotifications(true);
    // Mark all as read
    await axios.post(`${BASE_URL}/api/candidates/notifications/read`, {
      candidate_token: candidate.candidate_token,
    });
    fetchNotifications();
  };

  const handleSendFeedback = async () => {
    if (!candidate?.candidate_token || !selectedScheduleId || !feedback) {
      setNotification("Please fill all feedback fields.");
      return;
    }
    await axios.post(`${BASE_URL}/api/candidates/feedback`, {
      candidate_token: candidate.candidate_token,
      schedule_id: selectedScheduleId,
      feedback,
    });
    setShowFeedback(false);
    setFeedback("");
    setNotification("Thank you for your feedback!");
    fetchNotifications();
  };

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    navigate("/candidate-login");
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#f6fff8" }}>
      {/* Header with notification icon in navbar */}
      <DashboardHeader
        title=""
        onProfile={handleProfileOpen}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        sx={{ background: "#fff" }}
      />

      {/* Welcome and Attendance Status */}
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          color="#1b5e20"
          fontFamily="'Poppins', sans-serif"
          sx={{ letterSpacing: 1, mb: 2, fontSize: { xs: 22, md: 24 } }}
        >
          Welcome,{" "}
          <span style={{ color: "#000", fontWeight: 100 }}>{name}</span>!
        </Typography>
        {profile && profile.attendance_marked && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              background: "#e8f5e9",
              color: "#1b5e20",
              border: "1px solid #1b5e20",
              fontWeight: 500,
              fontSize: 16,
              boxShadow: "0 2px 8px 0 rgba(27,94,32,0.08)",
            }}
            icon={false}
          >
            <span style={{ fontWeight: 700 }}>
              Attendance marked successfully!
            </span>
            {profile.attendance_marked_at && (
              <span style={{ marginLeft: 8, fontWeight: 400 }}>
                (at {new Date(profile.attendance_marked_at).toLocaleString()})
              </span>
            )}
          </Alert>
        )}
      </Box>

      {/* Interview Table */}
      <Box sx={{ maxWidth: 1000, mx: "auto", mt: 2, px: 2, pb: 4 }}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "#fff",
            boxShadow: "0 4px 24px 0 rgba(27,94,32,0.07)",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color="#1b5e20"
            sx={{ mb: 2, letterSpacing: 0.5 }}
          >
            Your Interview Schedule & Status
          </Typography>
          <TableContainer>
            <Table
              size="small"
              sx={{
                background: "#fff",
                borderRadius: 2,
                "& th": {
                  background: "#1b5e20",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  letterSpacing: 0.5,
                },
                "& td": {
                  fontSize: 15,
                  borderBottom: "1px solid #e0e0e0",
                  color: "#222",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Interview Level</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ color: "#888" }}
                    >
                      No interviews scheduled yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  interviews.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:hover": { background: "#f1f8e9" },
                        transition: "background 0.2s",
                        borderLeft:
                          row.status === "Finished"
                            ? "4px solid #1b5e20"
                            : row.status === "Started"
                            ? "4px solid #388e3c"
                            : "4px solid #e0e0e0",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.interview_level}
                      </TableCell>
                      <TableCell>
                        {new Date(row.scheduled_time).toLocaleString()}
                      </TableCell>
                      <TableCell>{row.meeting_room_number}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              row.status === "Finished"
                                ? "#1b5e20"
                                : row.status === "Started"
                                ? "#388e3c"
                                : "#616161",
                            fontWeight: 600,
                          }}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              row.result === "Selected"
                                ? "#1b5e20"
                                : row.result === "Rejected"
                                ? "#d32f2f"
                                : "#616161",
                            fontWeight: 600,
                          }}
                        >
                          {row.result}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        {row.status === "Finished" && (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              background: "#1b5e20",
                              color: "#fff",
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: "0 2px 8px 0 rgba(27,94,32,0.08)",
                              "&:hover": { background: "#388e3c" },
                            }}
                            onClick={() => {
                              setShowFeedback(true);
                              setSelectedScheduleId(row.id);
                            }}
                          >
                            Give Feedback
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <ProfileDialog
          open={showProfile}
          onClose={() => setShowProfile(false)}
          profile={profile}
          title="Candidate Profile"
        />

        <Dialog
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
        >
          <DialogTitle
            sx={{
              background: "#1b5e20",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Notifications
          </DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
            <List>
              {notifications.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No notifications." />
                </ListItem>
              ) : (
                notifications.map((n, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={n.message}
                      secondary={new Date(n.created_at).toLocaleString()}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </DialogContent>
        </Dialog>

        {showFeedback && (
          <Paper
            sx={{
              p: 3,
              mt: 2,
              background: "#e8f5e9",
              border: "1px solid #1b5e20",
              borderRadius: 2,
              maxWidth: 500,
              mx: "auto",
              boxShadow: "0 2px 8px 0 rgba(27,94,32,0.08)",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="#1b5e20"
              sx={{ mb: 1 }}
            >
              Your Feedback
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback about the interview process"
              sx={{ mb: 2, background: "#fff", borderRadius: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSendFeedback}
              disabled={!feedback}
              sx={{
                background: "#1b5e20",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { background: "#388e3c" },
              }}
            >
              Submit
            </Button>
          </Paper>
        )}

        <Snackbar
          open={!!notification}
          autoHideDuration={3000}
          onClose={() => setNotification("")}
          message={notification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          ContentProps={{
            sx: {
              background: "#1b5e20",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CandidateDashboard;
