import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  MenuItem,
  Autocomplete,
  Chip,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../utils/baseurl";

const CreatePanels = () => {
  const navigate = useNavigate();

  // State for drives, interview levels, panel members, rooms, form fields
  const [drivesList, setDrivesList] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState("");
  const [noOfPanelRounds, setNoOfPanelRounds] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [panelMembers, setPanelMembers] = useState([]);
  const [selectedPanelMembers, setSelectedPanelMembers] = useState([]);
  const [interviewRooms, setInterviewRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedPanelMemberIds, setAssignedPanelMemberIds] = useState([]);
  const [assignedRoomIds, setAssignedRoomIds] = useState([]);


  // Fetch drives, panel members, rooms
  useEffect(() => {
    // Fetch drives from backend
    axios
      .get(`${BASE_URL}/api/ta/assigned-panel-members`)
      .then((res) => setAssignedPanelMemberIds(res.data))
      .catch((err) => console.error("Failed to fetch assigned panel members", err));
    axios
      .get(`${BASE_URL}/api/ta/assigned-interview-rooms`)
      .then((res) => setAssignedRoomIds(res.data))
      .catch((err) =>
        console.error("Failed to fetch assigned interview rooms", err)
      );
    axios
      .get(`${BASE_URL}/api/ta/drives/all`)
      .then((res) => setDrivesList(res.data));
    axios
      .get(`${BASE_URL}/api/ta/panel-members`)
      .then((res) => setPanelMembers(res.data));
    axios
      .get(`${BASE_URL}/api/ta/interview-rooms`)
      .then((res) => setInterviewRooms(res.data));

  }, []);

  useEffect(() => {
    if (!selectedDrive) {
      setNoOfPanelRounds(0);
      setSelectedLevels([]);
      return;
    }
    const drive = drivesList.find((d) => d.drive_id === selectedDrive);
    if (drive && drive.no_of_panel_rounds) {
      const rounds = Number(drive.no_of_panel_rounds);
      setNoOfPanelRounds(rounds);
      setSelectedLevels(Array(rounds).fill(""));
    } else {
      setNoOfPanelRounds(0);
      setSelectedLevels([]);
    }
  }, [selectedDrive, drivesList]);

  const handleCreatePanel = async () => {
    setLoading(true);

    if (!selectedPanelMembers.length || !selectedDrive) {
      alert("Please select panel members and a drive.");
      setLoading(false);
      return;
    }

    const panelName = selectedPanelMembers
      .map((m) => `${m.first_name} ${m.last_name}`)
      .join(" - ");

    console.log('mem name', panelName);

    try {
      await axios.post(`${BASE_URL}/api/ta/create-panels`, {
        panel_name: panelName,
        interview_level: selectedLevels[0],
        panel_members: selectedPanelMembers.map((m) => m.employee_id),
        interview_room_id: interviewRooms.find(
          (r) => r.meeting_room_number === selectedRoom
        )?.id,
        drive_id: selectedDrive,
      });

      alert("Panel created successfully");
      window.location.reload(); 
      // ✅ Reset states
      // setSelectedDrive("");
      // setNoOfPanelRounds(0);
      // setSelectedLevels([]);
      // setSelectedPanelMembers([]);
      // setSelectedRoom("");

    } catch (err) {
      console.error("❌ Error creating panel:", err);
      alert("Failed to create panel");
    } finally {
      setLoading(false);
    }
  };


  const handleLevelChange = (idx, value) => {
    const updated = [...selectedLevels];
    updated[idx] = value;
    setSelectedLevels(updated);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fafbfc",
        position: "relative",
      }}>
      {/* Back icon at top left */}
      <IconButton
        onClick={() => navigate("/dashboard/ta")}
        sx={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}
        aria-label="back">
        <ArrowBackIcon />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}>
        <Paper sx={{ p: 4, minWidth: 400 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Create Panels
          </Typography>

          <TextField
            select
            label="Drives"
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}>
            <MenuItem value="" disabled>
              Select a drive
            </MenuItem>
            {drivesList.map((d) => (
              <MenuItem key={d.drive_id} value={d.drive_id}>
                {d.drive_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Interview Level"
            value={selectedLevels[0] || ""}
            onChange={(e) => setSelectedLevels([e.target.value])}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Select interview level
            </MenuItem>
            {[...Array(noOfPanelRounds)].map((_, idx) => (
              <MenuItem key={idx} value={`L${idx + 1}`}>
                {`L${idx + 1}`}
              </MenuItem>
            ))}
          </TextField>



          <Autocomplete
            multiple
            // options={panelMembers}
            // options={panelMembers.filter(
            //   (member) =>
            //     !selectedPanelMembers.find(
            //       (selected) => selected.employee_id === member.employee_id
            //     )
            // )}
            options={panelMembers
              .filter((m) => !assignedPanelMemberIds.includes(m.employee_id))
              .filter((m) => !selectedPanelMembers.some((s) => s.employee_id === m.employee_id))
            }

            getOptionLabel={(option) =>
              option.first_name && option.last_name
                ? `${option.first_name} ${option.last_name}`
                : option.office_email_id || ""
            }
            value={selectedPanelMembers}
            onChange={(event, value) => setSelectedPanelMembers(value)}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => {
                const tagProps = getTagProps({ index });
                const { key, ...cleanTagProps } = tagProps;
                return (
                  <Chip
                    key={option.employee_id || index}
                    label={
                      option.first_name && option.last_name
                        ? `${option.first_name} ${option.last_name}`
                        : option.office_email_id
                    }
                    {...cleanTagProps}
                  />
                );
              })
            }

            renderInput={(params) => (
              <TextField
                {...params}
                label="Panel Members"
                placeholder="Select panel members"
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Interview Rooms"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}>
            <MenuItem value="" disabled>
              No rooms available
            </MenuItem>
            {interviewRooms
  .filter((room) => !assignedRoomIds.includes(room.id))
  .map((room) => (
    <MenuItem key={room.id} value={room.meeting_room_number}>
      {`${room.office} Building, ${room.floor}th Floor, Meeting Room : ${room.meeting_room_number}`}
    </MenuItem>
))}

          </TextField>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleCreatePanel}
            disabled={loading}>
            Create Panel
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreatePanels;
