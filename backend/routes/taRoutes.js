const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // adjust path as needed

const {
  getAssignmentsForBU,
  createDriveHandler,
  getLastDrive,
  getAvailableHuskyIds,
  getDriveLocations,
  getAllDrives,
  getCandidatesForScheduling,
  getInterviewers,
  getRooms,
  getPanels,
  autoScheduleInterviews,
  manualScheduleInterview,
  getAllSchedules,
  getDrives,
  getAssignedPanelMembers,
  getAssignedInterviewRoomIdsController,
  getAllPanels,
  getDrivePanelCandidateTable,
} = require("../controllers/taController");

router.get("/assignments/bu", getAssignmentsForBU);
router.post("/drives", createDriveHandler); // createDriveHandler must be a function
router.get("/drives/last", getLastDrive);
router.get("/available-husky-ids", getAvailableHuskyIds);
router.get("/drive-locations", getDriveLocations);
router.get("/drives/all", getAllDrives);
router.get("/drives", getDrives);

router.get("/drives/:driveId", async (req, res) => {
  const { driveId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM drives WHERE drive_id = $1",
      [driveId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Drive not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//CREATE PANEL ROUTES
const {
  getAllInterviewRoomsController,
  getColleaguesController,
  createPanelController,
} = require("../controllers/taController");
router.get("/interview-rooms", getAllInterviewRoomsController);
// const { getColleaguesController } = require("../controllers/taController");
router.get("/panel-members", getColleaguesController);
// const { createPanelController } = require("../controllers/taController");
router.post("/create-panels", createPanelController);
router.get("/assigned-panel-members", getAssignedPanelMembers);
router.get("/assigned-interview-rooms", getAssignedInterviewRoomIdsController);

// SCHEDULING ROUTES
router.get("/candidates-for-scheduling", getCandidatesForScheduling);
router.get("/interviewers", getInterviewers);
router.get("/rooms", getRooms);
router.get("/panels", getPanels);
router.post("/auto-schedule", autoScheduleInterviews);
router.post("/manual-schedule", manualScheduleInterview);
router.get("/schedules", getAllSchedules);
router.get("/panels/all", getAllPanels);
router.get("/table-view", getDrivePanelCandidateTable);

module.exports = router;
// basaskasjn
