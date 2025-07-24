import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ManualScheduleForm from "../components/ManualScheduleForm";
import ScheduleTable from "../components/ScheduleTable";

const ScheduleInterviews = () => {
  const [view, setView] = useState(""); // "manual", "view"

  // Handler for Auto Schedule button
  const handleAutoSchedule = () => {
    alert("Auto Schedule Interviews Coming Soon...");
  };

  // Handler for back arrow
  const handleBack = () => {
    if (window.history) {
      window.history.back();
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", background: "#fafbfc", width: "100vw", p: 0 }}
    >
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Schedule Interviews
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 6,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ textTransform: "none", minWidth: 180, mb: 2 }}
          onClick={handleAutoSchedule}
        >
          Auto Schedule All
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ textTransform: "none", minWidth: 180, mb: 2 }}
          onClick={() => setView("manual")}
        >
          Manual Schedule
        </Button>
        <Button
          variant="outlined"
          color="success"
          size="large"
          sx={{ textTransform: "none", minWidth: 180 }}
          onClick={() => setView("view")}
        >
          Show Schedule
        </Button>
      </Box>

      {/* Show Manual Schedule Form or Schedule Table */}
      <Box sx={{ mt: 4 }}>
        {view === "manual" && <ManualScheduleForm />}
        {view === "view" && <ScheduleTable />}
      </Box>
    </Box>
  );
};

export default ScheduleInterviews;
