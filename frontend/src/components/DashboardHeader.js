import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Badge,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";

const DashboardHeader = ({
  title = "Dashboard",
  onProfile,
  onLogout,
  onDriveConfig,
  showDriveConfig,
  notificationCount,
  onNotificationClick,
}) => (
  <AppBar
    position="static"
    color="success"
    sx={{
      boxShadow: 1,
      minHeight: 48,
      width: "100vw", // Ensure full viewport width
      left: 0,
      top: 0,
    }}
  >
    <Toolbar
      sx={{
        minHeight: 48,
        px: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "center",
        position: "relative", // Add this
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          letterSpacing: 1,
          color: "#fff",
          textAlign: "center",
          fontSize: { xs: "1rem", md: "1.1rem" },
          position: "absolute", // Add this
          left: "50%", // Add this
          transform: "translateX(-50%)", // Add this
          width: "max-content", // Add this for better centering
          zIndex: 1, // Ensure it's above other elements
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          marginLeft: "auto",
        }}
      >
        {showDriveConfig && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onDriveConfig}
            sx={{
              borderColor: "white",
              color: "white",
              fontWeight: 500,
              background: "rgba(255,255,255,0.08)",
              fontSize: { xs: "0.85rem", md: "1rem" },
              "&:hover": { background: "#228B22", borderColor: "#fff" },
            }}
          >
            Create Drive
          </Button>
        )}
        {/* Notification Icon */}
        {typeof notificationCount !== "undefined" && onNotificationClick && (
          <IconButton color="inherit" onClick={onNotificationClick}>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}
        <IconButton color="inherit" onClick={onProfile}>
          <AccountCircle />
        </IconButton>
        <IconButton color="inherit" onClick={onLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Toolbar>
  </AppBar>
);

export default DashboardHeader;
