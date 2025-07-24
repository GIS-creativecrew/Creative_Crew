import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Autocomplete,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
} from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext"; // <-- import context
import * as XLSX from "xlsx"; // Add this at the top for Excel parsing
import ProfileDialog from "../components/ProfileDialog";
import CandidateRegistrationForm from "../components/CandidateRegistrationForm";
import CandidateExcelImport from "../components/CandidateExcelImport";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const modes = ["Online", "Offline", "Hybrid"];
const role = "TA";

const TADashboard = () => {
  const { user, setUser, setToken } = useAuth(); // <-- get user from context
  const [form, setForm] = useState({
    drive_name: "",
    drive_date: "",
    mode_of_interview: "",
    drive_details: "",
    no_of_openings: "",
  });
  const [message, setMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profile, setProfile] = useState(null);
  const [assignedBUs, setAssignedBUs] = useState([]);
  const [assignedHuskyIds, setAssignedHuskyIds] = useState([]);
  const [buOptions, setBuOptions] = useState([]);
  const [huskyOptions, setHuskyOptions] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [importMode, setImportMode] = useState(""); // "excel" or "manual"
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [registeredCandidates, setRegisteredCandidates] = useState([]);
  const [showCandidatePreview, setShowCandidatePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showDriveConfig, setShowDriveConfig] = useState(false);
  const [candidateImportMode, setCandidateImportMode] = useState(""); // "excel" or "manual"
  const [createdDrive, setCreatedDrive] = useState(null);
  const [showDriveDetails, setShowDriveDetails] = useState(false);
  const [allDrives, setAllDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState("");
  // New drive form state
  const [driveForm, setDriveForm] = useState({
    drive_name: "",
    drive_date: "",
    bu_id: user?.bu_id || "",
    mode_of_interview: "",
    country: "",
    state: "",
    city: "",
    building: "",
    drive_details: "",
    no_of_openings: "",
    created_by: user?.employee_id || "",
    husky_ids: [],
    candidates: [],
    time_slot: "",
    number_of_panel_rounds: "", // <-- Add this line
  });

  const [driveTypes, setDriveTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [interviewRooms, setInterviewRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  // Panel members state
  const [panelMembers, setPanelMembers] = useState([]);
  const [selectedPanelMembers, setSelectedPanelMembers] = useState([]);

  // Fetch interview rooms for dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log(`${BASE_URL}`);
        const res = await axios.get(`${BASE_URL}/api/ta/interview-rooms`);
        console.log("Interview Rooms:", res.data);
        setInterviewRooms(res.data);
      } catch {
        setInterviewRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Fetch panel members for dropdown
  useEffect(() => {
    const fetchPanelMembers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/ta/panel-members`);
        setPanelMembers(res.data);
      } catch {
        setPanelMembers([]);
      }
    };
    fetchPanelMembers();
  }, []);

  // Add these at the top of your component
  const [modeOptions] = useState(["Physical", "Virtual"]);
  const [drivesList, setDrivesList] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Profile dialog
  const handleProfileOpen = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/employees/profile?email=${user.office_email_id}`
      );
      setProfile(res.data);
    } catch (err) {
      setProfile(null);
      alert("Failed to load profile. Please try again.");
    }
    setShowProfile(true);
    setLoading(false);
  };

  const handleProfileClose = () => setShowProfile(false);

  // Password dialog
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

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  // Home
  const handleHome = () => {
    navigate("/dashboard/ta");
  };

  // Drive config
  // When opening the drive config dialog
  const handleDriveConfig = async () => {
    setDriveForm((prev) => ({
      ...prev,
      bu_id: user.bu_id,
      husky_ids: [],
      no_of_openings: "",
    }));

    try {
      const res = await axios.get(
        `${BASE_URL}/api/ta/available-husky-ids?bu_id=${user.bu_id}`
      );
      setHuskyOptions(res.data); // Only available IDs
    } catch {
      setHuskyOptions([]);
    }

    setShowDriveConfig(true);
  };
  const handleDriveConfigClose = () => setShowDriveConfig(false);

  // Create drive
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setForm({
        drive_name: "",
        drive_date: "",
        mode_of_interview: "",
        drive_details: "",
        no_of_openings: "",
      });
      setMessage("Drive created successfully!");
      // fetchDrives();
      setShowDriveConfig(false);
    } catch {
      // Remove or comment out this line:
      // setMessage("Failed to create drive.");
      // Optionally, you can log the error for debugging:
      // console.error("Drive creation failed");
    }
  };

  const bu = user && user.bu ? user.bu : ""; // Safe access

  useEffect(() => {
    if (!user || user.role !== "TA" || !user.bu_id) return;
    axios
      .get(`${BASE_URL}/api/ta/assignments/bu?bu_id=${user.bu_id}`)
      .then((res) => setAssignedHuskyIds(res.data))
      .catch(() => setAssignedHuskyIds([]));
  }, [user?.bu_id, user?.role]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/ta/drive-locations`)
      .then((res) => {
        setLocationOptions({
          country: res.data.countries,
          state: res.data.states,
          city: res.data.cities,
          building: res.data.buildings,
          floor: [],
          roomno: [],
        });
      })
      .catch(() => {
        setLocationOptions({
          country: [],
          state: [],
          city: [],
          building: [],
          floor: [],
          roomno: [],
        });
      });
  }, []);
  useEffect(() => {
    if (selectedDriveId) {
      fetchDriveDetails(selectedDriveId);
    }
  }, [selectedDriveId]);
  // Location state
  const [locationOptions, setLocationOptions] = useState({
    country: [],
    state: [],
    city: [],
    building: [],
    floor: [],
    roomno: [],
  });
  const [newLocation, setNewLocation] = useState({
    country: "",
    state: "",
    city: "",
    building: "",
    floor: "",
    roomno: "",
  });

  // Helper to add new location value
  const handleAddLocationValue = (field) => {
    if (
      newLocation[field] &&
      !locationOptions[field].includes(newLocation[field])
    ) {
      setLocationOptions((prev) => ({
        ...prev,
        [field]: [...prev[field], newLocation[field]],
      }));
      setDriveForm((prev) => ({
        ...prev,
        [field]: newLocation[field],
      }));
      setNewLocation((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle form change
  const handleDriveFormChange = (e) => {
    setDriveForm({ ...driveForm, [e.target.name]: e.target.value });
  };

  // Handle candidate selection
  const handleCandidateChange = (event, value) => {
    setDriveForm({ ...driveForm, candidates: value });
  };

  // Handle submit
  const handleDriveSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/api/ta/drives`, {
        drive_name: driveForm.drive_name,
        drive_date: driveForm.drive_date,
        bu_id: user.bu_id,
        mode_of_interview: driveForm.mode_of_interview,
        country: driveForm.country,
        state: driveForm.state,
        city: driveForm.city,
        building: driveForm.building,
        drive_details: driveForm.drive_details,
        no_of_openings: Number(driveForm.no_of_openings),
        no_of_panel_rounds: Number(driveForm.number_of_panel_rounds),
        created_by: user.employee_id,
        husky_ids: driveForm.husky_ids.map((h) => h.husky_id || h),
        time_slot: driveForm.time_slot, // <-- use time_slot here, not drive_slot
      });

      setCreatedDrive(res.data);
      setMessage("Drive created successfully!");
      setShowDriveConfig(false);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create drive. Check logs."
      );
    }
  };

  // Handle Excel file selection
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  // Parse Excel file
  const handleExcelImport = () => {
    if (!excelFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(json);
      // Optionally, map json to driveForm fields and submit to backend
    };
    reader.readAsArrayBuffer(excelFile);
  };

  const bu_id = user && user.bu_id ? user.bu_id : null;

  if (!user) {
    return (
      <Typography sx={{ mt: 4, textAlign: "center" }}>Loading...</Typography>
    );
  }
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/candidates/list`);
      setRegisteredCandidates(res.data);
    } catch {
      setRegisteredCandidates([]);
    }
  };
  const handlePreviewDrive = async () => {
    setShowDriveDetails(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/ta/drives/all`);
      setAllDrives(res.data);
      if (res.data.length > 0) {
        setSelectedDriveId(res.data[0].drive_id);
        // Fetch details for first drive
        fetchDriveDetails(res.data[0].drive_id);
      }
    } catch {
      setAllDrives([]);
      setCreatedDrive(null);
    }
  };

  const fetchDriveDetails = async (driveId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/ta/drives/${driveId}`);
      setCreatedDrive(res.data);
    } catch {
      setCreatedDrive(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDriveSubmitFromExcel = async (excelRow) => {
    // Map Excel columns to your drive fields
    const mappedDrive = {
      drive_name: excelRow.drive_name || excelRow["Drive Name"] || "",
      drive_date: excelRow.drive_date || excelRow["Drive Date"] || "",
      bu_id: user.bu_id,
      mode_of_interview:
        excelRow.mode_of_interview || excelRow["Mode of Interview"] || "",
      country: excelRow.country || excelRow["Country"] || "",
      state: excelRow.state || excelRow["State"] || "",
      city: excelRow.city || excelRow["City"] || "",
      building: excelRow.building || excelRow["Building"] || "",
      drive_details: excelRow.drive_details || excelRow["Drive Details"] || "",
      no_of_openings: Number(
        excelRow.no_of_openings || excelRow["Number of Openings"] || 0
      ),
      no_of_panel_rounds: Number(
        excelRow.no_of_panel_rounds || excelRow["Number of Panel Rounds"] || 1
      ),
      created_by: user.employee_id,
      husky_ids: (excelRow.husky_ids || excelRow["Husky IDs"] || "")
        .toString()
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
      time_slot: excelRow.time_slot || excelRow["Time Slot"] || "",
    };

    try {
      await axios.post(`${BASE_URL}/api/ta/drives`, mappedDrive);
      setMessage("Drive imported successfully!");
      setExcelFile(null);
      setExcelData([]);
      setShowDriveConfig(false);
    } catch (err) {
      setMessage("Failed to import drive from Excel.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <DashboardHeader
        title="TA Dashboard"
        onHome={handleHome}
        onProfile={handleProfileOpen}
        onLogout={handleLogout}
      />

      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          mt: isMobile ? 2 : 4,
          px: isMobile ? 1 : 0,
          pb: 4,
        }}>
        {/* Configure Drive Details Dialog */}
        <Dialog
          open={showDriveConfig}
          onClose={handleDriveConfigClose}
          fullWidth
          maxWidth="md">
          <DialogTitle>Create Drive/Interview</DialogTitle>
          <DialogContent>
            <form onSubmit={handleDriveSubmit}>
              <TextField
                label="Drive Name"
                name="drive_name"
                value={driveForm.drive_name}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Drive 
                'Date"
                name="drive_date"
                type="date"
                value={driveForm.drive_date}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Business Unit (BU)"
                name="bu_name"
                value={user && user.bu_name ? user.bu_name : ""}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
                disabled
              />
              {/* Husky ID multi-select */}
              <Autocomplete
                multiple
                options={huskyOptions}
                getOptionLabel={(option) => option.husky_id}
                value={driveForm.husky_ids}
                onChange={(event, value) => {
                  setDriveForm((prev) => ({
                    ...prev,
                    husky_ids: value,
                    no_of_openings: value.length, // Always a number!
                  }));
                }}
                disableCloseOnSelect
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => {
                    const tagProps = getTagProps({ index });
                    const { key, ...rest } = tagProps;
                    return (
                      <Chip
                        key={key}
                        label={option.husky_id ? option.husky_id : option}
                        {...rest}
                        color={option.husky_id ? "primary" : undefined}
                        sx={{ mr: 1, mb: 0.5 }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Husky IDs"
                    margin="normal"
                    placeholder="Choose one or more"
                    // required removed
                  />
                )}
              />

              {/* Mode of Drive */}
              <TextField
                select
                label="Mode of Drive"
                name="mode_of_interview"
                value={driveForm.mode_of_interview}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                required>
                {modeOptions.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </TextField>

              {/* Show location fields only if not Virtual */}
              {driveForm.mode_of_interview !== "Virtual" && (
                <>
                  {[
                    ["country", "state"],
                    ["city", "building"],
                  ].map((pair, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {pair.map((field) => (
                        <Autocomplete
                          key={field}
                          freeSolo
                          options={locationOptions[field] || []}
                          value={driveForm[field] || ""}
                          onChange={(event, value) => {
                            // Add new value to options if not present
                            if (
                              value &&
                              !locationOptions[field].includes(value)
                            ) {
                              setLocationOptions((prev) => ({
                                ...prev,
                                [field]: [...prev[field], value],
                              }));
                            }
                            setDriveForm((prev) => ({
                              ...prev,
                              [field]: value,
                            }));
                          }}
                          onInputChange={(event, value) => {
                            setDriveForm((prev) => ({
                              ...prev,
                              [field]: value,
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                field.charAt(0).toUpperCase() + field.slice(1)
                              }
                              sx={{ width: 410, mr: 2 }}
                              placeholder={`Select or type ${field}`}
                            />
                          )}
                        />
                      ))}
                    </Box>
                  ))}
                </>
              )}

              {/* Time Slot */}
              <TextField
                label="Time Slot"
                name="time_slot"
                value={driveForm.time_slot}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                required
              />

              {/* Number of Openings */}
              <TextField
                label="Number of Openings"
                name="no_of_openings"
                type="number"
                value={driveForm.no_of_openings}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
                required
              />

              {/* Number of Panel Rounds */}
              <TextField
                label="Number of Panel Rounds"
                name="number_of_panel_rounds"
                type="number"
                value={driveForm.number_of_panel_rounds}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                required
              />

              {/* Drive Details */}
              <TextField
                label="Drive Details"
                name="drive_details"
                value={driveForm.drive_details}
                onChange={handleDriveFormChange}
                fullWidth
                margin="normal"
                multiline
                minRows={2}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}>
                <Button onClick={handleDriveConfigClose} color="inherit">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "green",
                    color: "#fff",
                    border: "2px solid green",
                    "&:hover": {
                      backgroundColor: "#228B22",
                      borderColor: "#228B22",
                    },
                  }}>
                  Save Drive
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <ProfileDialog
          open={showProfile}
          onClose={handleProfileClose}
          profile={profile}
          onChangePassword={handlePasswordDialogOpen}
          title="TA Profile"
        />

        {/* Password Change Dialog */}
        <Dialog
          open={showPasswordDialog}
          onClose={handlePasswordDialogClose}
          fullWidth
          maxWidth="xs">
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
                color={
                  passwordMsg.includes("success") ? "success.main" : "error"
                }
                sx={{ mt: 1 }}>
                {passwordMsg}
              </Typography>
              <DialogActions>
                <Button onClick={handlePasswordDialogClose}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ background: "green" }}>
                  Change Password
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assigned Husky IDs Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            Assigned Husky IDs for BU:{" "}
            <span style={{ fontWeight: 400 }}>
              {user && user.bu_name ? user.bu_name : "Not available"}
            </span>
          </Typography>
          {!user || !user.bu_id ? (
            <Typography color="error" variant="body2">
              No ID's found for this user.
            </Typography>
          ) : assignedHuskyIds.length === 0 ? (
            <Typography variant="body2">No assignments yet.</Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}>
                <thead>
                  <tr style={{ background: "#f7f7f7" }}>
                    <th
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",
                        fontWeight: 500,
                        textAlign: "left",
                      }}>
                      #
                    </th>
                    <th
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",
                        fontWeight: 500,
                        textAlign: "left",
                      }}>
                      Husky ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignedHuskyIds.map((a, idx) => (
                    <tr
                      key={a.husky_id}
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                      }}>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                        }}>
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                        }}>
                        {a.husky_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>

        {/* Import Drive Details Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            Configure Drive Details
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDriveConfig}>
              Create Drive/Interview
            </Button>
            <Button
              variant={importMode === "excel" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setImportMode("excel")}>
              Import from Excel
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={handlePreviewDrive}>
              Preview Drive Details
            </Button>
          </Box>

          {importMode === "excel" && (
            <Box sx={{ mb: 3 }}>
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
                onClick={async () => {
                  // Map the first row of excelData to driveForm fields and submit
                  if (excelData.length === 0) return;
                  const d = excelData[0];
                  // You may want to map fields more robustly here
                  await handleDriveSubmitFromExcel(d);
                }}
                disabled={excelData.length === 0}
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
                }}
                sx={{ ml: 1 }}
                disabled={!excelFile && excelData.length === 0}
              >
                Cancel Import
              </Button>
              {excelData.length > 0 && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2">Preview Imported Data:</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {Object.keys(excelData[0]).map((key) => (
                            <TableCell key={key}>{key}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {excelData.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.keys(excelData[0]).map((key) => (
                              <TableCell key={key}>{row[key]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          )}
        </Paper>

        {/* Panels Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          {/* <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Panels
          </Typography> */}
          {/* Add this button after Configure Drive Details div */}
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, mr: 2 }}
            onClick={() => navigate("/dashboard/ta/panel-table")}
          >
            View Panel Table
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate("/dashboard/ta/create-panels")}>
            Go to Create Panels Page
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => navigate("/dashboard/ta/schedule-interviews")}>
            Schedule Interviews
          </Button>
        </Paper>

        {/* Candidate Registration Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            Candidate Registration
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant={
                candidateImportMode === "manual" ? "contained" : "outlined"
              }
              onClick={() => setCandidateImportMode("manual")}>
              Manual Registration
            </Button>
            <Button
              variant={
                candidateImportMode === "excel" ? "contained" : "outlined"
              }
              onClick={() => setCandidateImportMode("excel")}>
              Import from Excel
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                await fetchCandidates();
                setShowCandidatePreview(true);
              }}>
              Preview Added Candidates
            </Button>
          </Box>
          {candidateImportMode === "manual" && (
            <CandidateRegistrationForm onSuccess={fetchCandidates} />
          )}
          {candidateImportMode === "excel" && (
            <CandidateExcelImport onSuccess={fetchCandidates} />
          )}
          <Dialog
            open={showCandidatePreview}
            onClose={() => setShowCandidatePreview(false)}
            fullWidth
            maxWidth="md">
            <DialogTitle>Registered Candidates Preview</DialogTitle>
            <DialogContent>
              {registeredCandidates.length === 0 ? (
                <Typography>No candidates registered yet.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Applied Position</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registeredCandidates.map((c) => (
                        <TableRow key={c.candidate_token}>
                          <TableCell>{c.first_name}</TableCell>
                          <TableCell>{c.last_name}</TableCell>
                          <TableCell>{c.email_id}</TableCell>
                          <TableCell>{c.phone_number}</TableCell>
                          <TableCell>{c.applied_position}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCandidatePreview(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>

        {showDriveDetails && (
          <Dialog
            open={showDriveDetails}
            onClose={() => setShowDriveDetails(false)}
            fullWidth
            maxWidth="md">
            <DialogTitle>Drive Details Preview</DialogTitle>
            <DialogContent>
              {allDrives.length > 0 && (
                <TextField
                  select
                  label="Select Drive"
                  value={selectedDriveId}
                  onChange={(e) => {
                    setSelectedDriveId(e.target.value);
                    fetchDriveDetails(e.target.value);
                  }}
                  fullWidth
                  sx={{ mb: 2 }}>
                  {allDrives.map((d) => (
                    <MenuItem key={d.drive_id} value={d.drive_id}>
                      {d.drive_name} ({d.drive_date})
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {createdDrive ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Drive Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Drive Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Business Unit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Mode of Interview</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Building</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Drive Details</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>No. of Openings</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Panel Rounds</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time Slot</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{createdDrive.drive_name}</TableCell>
                        <TableCell>
                          {createdDrive.drive_date
                            ? formatDate(createdDrive.drive_date)
                            : ""}
                        </TableCell>
                        <TableCell>{createdDrive.bu_id}</TableCell>
                        <TableCell>{createdDrive.mode_of_interview}</TableCell>
                        <TableCell>{createdDrive.country}</TableCell>
                        <TableCell>{createdDrive.state}</TableCell>
                        <TableCell>{createdDrive.city}</TableCell>
                        <TableCell>{createdDrive.building}</TableCell>
                        <TableCell>{createdDrive.drive_details}</TableCell>
                        <TableCell>{createdDrive.no_of_openings}</TableCell>
                        <TableCell>{createdDrive.no_of_panel_rounds}</TableCell>
                        <TableCell>{createdDrive.time_slot}</TableCell>
                        <TableCell>{createdDrive.created_by}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="warning.main" sx={{ mt: 2 }}>
                  No drive selected.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDriveDetails(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {message && (
          <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={() => setMessage("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert severity="success" onClose={() => setMessage("")}>
              {message}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default TADashboard;
