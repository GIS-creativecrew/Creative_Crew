import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
} from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import ProfileDialog from "../components/ProfileDialog";
import * as XLSX from "xlsx";

const BU_OPTIONS = [
  { bu_id: 3, bu: "GIS", husky_id: "HUSKY-GIS-001" },
  { bu_id: 3, bu: "GIS", husky_id: "HUSKY-GIS-002" },
  { bu_id: 3, bu: "GIS", husky_id: "HUSKY-GIS-003" },
  { bu_id: 1, bu: "CR", husky_id: "HUSKY-CR-004" },
  { bu_id: 1, bu: "CR", husky_id: "HUSKY-CR-005" },
  { bu_id: 5, bu: "IP&I", husky_id: "HUSKY-IP&I-006" },
  { bu_id: 5, bu: "IP&I", husky_id: "HUSKY-IP&I-007" },
];

const TALeadDashboard = () => {
  const { user, setUser, setToken, token } = useAuth();
  const [selectedBUs, setSelectedBUs] = useState([]);
  const [sendMessage, setSendMessage] = useState("");
  const [messageColor, setMessageColor] = useState("success");
  const [assigned, setAssigned] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [importMsg, setImportMsg] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/talead/assigned`);
        const data = await res.json();
        setAssigned(data);
      } catch {
        setAssigned([]);
      }
    };
    fetchAssigned();
  }, []);

  const availableOptions = BU_OPTIONS.filter(
    (opt) =>
      !assigned.some(
        (a) => a.bu_id === opt.bu_id && a.husky_id === opt.husky_id
      )
  );

  const handleBUSelect = (buObj) => {
    setSelectedBUs((prev) =>
      prev.some((b) => b.husky_id === buObj.husky_id)
        ? prev.filter((b) => b.husky_id !== buObj.husky_id)
        : [...prev, buObj]
    );
  };

  const handleSendToTA = async () => {
    const assignments = selectedBUs.map((buObj) => ({
      bu_id: buObj.bu_id,
      husky_id: buObj.husky_id,
    }));

    try {
      const res = await fetch(`${BASE_URL}/api/talead/assign-bu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments,
          assigned_by: user.employee_id,
        }),
      });
      const data = await res.json();
      setSendMessage(data.message);
      setMessageColor("success");
      setSelectedBUs([]);
      const assignedRes = await fetch(`${BASE_URL}/api/talead/assigned`);
      setAssigned(await assignedRes.json());
    } catch (err) {
      setSendMessage("Failed to send assignments.");
      setMessageColor("error");
    }
  };

  // Excel import handlers for BU_OPTIONS
  const handleExcelFileChange = (e) => {
    setExcelFile(e.target.files[0]);
    setImportMsg("");
  };

  const handleExcelImport = () => {
    if (!excelFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      // Only update BU_OPTIONS from Excel
      setExcelData(json);
      setImportMsg("");
    };
    reader.readAsArrayBuffer(excelFile);
  };

  const handleImportBUOptions = () => {
    if (!excelData.length) {
      setImportMsg("No data to import.");
      return;
    }
    // Validate columns: bu_id, bu, husky_id
    const valid = excelData.every(
      (row) => row.bu_id && row.bu && row.husky_id
    );
    if (!valid) {
      setImportMsg("Each row must have bu_id, bu, and husky_id.");
      return;
    }
    // Replace BU_OPTIONS (in real app, this should be in global state or backend)
    // Here, just for this session:
    BU_OPTIONS.length = 0;
    excelData.forEach((row) => BU_OPTIONS.push({
      bu_id: row.bu_id,
      bu: row.bu,
      husky_id: row.husky_id,
    }));
    setImportMsg("BU & Husky IDs imported for this session!");
    setExcelFile(null);
    setExcelData([]);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  // Password dialog handlers
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
      await axios.post(
        `${BASE_URL}/api/employees/change-password`,
        {
          email: user.office_email_id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMsg("Password changed successfully!");
      setTimeout(handlePasswordDialogClose, 1200);
    } catch (err) {
      setPasswordMsg(
        err.response?.data?.message || "Failed to change password."
      );
    }
  };

  // Use context user for profile
  const profile = user;
  const bu = user && user.bu ? user.bu : "";

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <DashboardHeader
        title="TA Lead Dashboard"
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
        showDriveConfig={false}
      />

      <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
        <Typography variant="h6" color="black" sx={{ mb: 2 }}>
          Select Business Units & Husky IDs to send to TA
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Excel Import Section for BU_OPTIONS */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Import Business Units & Husky IDs from Excel
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelFileChange}
              style={{ marginBottom: 8 }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExcelImport}
              disabled={!excelFile}
              sx={{ ml: 1 }}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleImportBUOptions}
              disabled={!excelData.length}
              sx={{ ml: 1 }}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setExcelFile(null);
                setExcelData([]);
                setImportMsg("");
              }}
              sx={{ ml: 1 }}
              disabled={!excelFile && !excelData.length}
            >
              Cancel Import
            </Button>
            {importMsg && (
              <Typography color={importMsg.includes("success") ? "success.main" : "error"} sx={{ mt: 1 }}>
                {importMsg}
              </Typography>
            )}
            {excelData.length > 0 && (
              <Paper sx={{ mt: 2, p: 2, overflowX: "auto" }}>
                <Typography variant="subtitle2">Preview Imported Data:</Typography>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                  <thead>
                    <tr style={{ background: "#f7f7f7" }}>
                      {Object.keys(excelData[0]).map((key) => (
                        <th
                          key={key}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #e0e0e0",
                            fontWeight: 500,
                            textAlign: "left",
                          }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        {Object.keys(excelData[0]).map((key) => (
                          <td
                            key={key}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            )}
          </Box>
          {/* Manual Selection Section */}
          <br/>
          {availableOptions.length === 0 ? (
            <Typography color="success.main">
              All Husky IDs have been assigned!
            </Typography>
          ) : (
            availableOptions.map((buObj) => (
              <Box
                key={buObj.bu + buObj.husky_id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  {buObj.bu} (Husky ID: {buObj.husky_id})
                </Typography>
                <Button
                  variant={
                    selectedBUs.some(
                      (b) =>
                        b.bu === buObj.bu && b.husky_id === buObj.husky_id
                    )
                      ? "contained"
                      : "outlined"
                  }
                  color="success"
                  onClick={() => handleBUSelect(buObj)}
                >
                  {selectedBUs.some(
                    (b) =>
                      b.bu === buObj.bu && b.husky_id === buObj.husky_id
                  )
                    ? "Selected"
                    : "Select"}
                </Button>
              </Box>
            ))
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={selectedBUs.length === 0}
            onClick={handleSendToTA}
          >
            Send to TA
          </Button>
          <Typography color={messageColor === "success" ? "success.main" : "error"} sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {sendMessage}
          </Typography>
        </Paper>
      </Box>

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onChangePassword={handlePasswordDialogOpen}
        title="TA Lead Profile"
      />

      {/* Password Change Dialog */}
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
            <Typography color={passwordMsg.includes("success") ? "success.main" : "error"} sx={{ mt: 1 }}>
              {passwordMsg}
            </Typography>
            <DialogActions>
              <Button onClick={handlePasswordDialogClose}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ background: "green" }}>
                Change Password
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TALeadDashboard;
