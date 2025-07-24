// adshjojjdsn

const pool = require("../config/db");

//GET INTERVIEW ROOMS
const {
  getAllInterviewRooms,
  getAssignedInterviewRoomIds,
} = require("../models/taModels");
const getAllInterviewRoomsController = async (req, res) => {
  try {
    const rooms = await getAllInterviewRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET INTERVIEWERS
const { getColleagues } = require("../models/taModels");
const getColleaguesController = async (req, res) => {
  try {
    const rooms = await getColleagues();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignmentsForBU = async (req, res) => {
  const { bu_id } = req.query;
  if (!bu_id) return res.status(400).json({ message: "BU ID required" });
  try {
    const result = await pool.query(
      "SELECT husky_id FROM bu_husky_ids WHERE bu_id = $1",
      [bu_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CRAETE PANEL
const { createPanel } = require("../models/taModels");
const createPanelController = async (req, res) => {
  try {
    const {
      panel_name,
      interview_level,
      panel_members,
      interview_room_id,
      drive_id,
    } = req.body;

    // Validate all required fields
    if (
      !panel_name ||
      !interview_level ||
      !panel_members ||
      !interview_room_id ||
      !drive_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(panel_members)) {
      return res
        .status(400)
        .json({ message: "panel_members must be an array" });
    }

    const panel = await createPanel({
      panel_name,
      interview_level,
      panel_members,
      interview_room_id,
      drive_id,
    });

    res.status(201).json(panel);
  } catch (error) {
    // console.error("❌ Error creating panel:", error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createDriveHandler = async (req, res) => {
  try {
    const {
      drive_name,
      drive_date,
      bu_id,
      mode_of_interview,
      country,
      state,
      city,
      building,
      time_slot, // <-- must be here
      drive_details,
      no_of_openings,
      no_of_panel_rounds,
      created_by,
      husky_ids,
    } = req.body;

    const query = `
      INSERT INTO drives (
        drive_name, drive_date, bu_id, mode_of_interview, country, state, city, building, time_slot, drive_details, no_of_openings, no_of_panel_rounds, created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;
    const values = [
      drive_name,
      drive_date,
      bu_id,
      mode_of_interview,
      country,
      state,
      city,
      building,
      time_slot, // <-- must be here
      drive_details,
      Number(no_of_openings),
      Number(no_of_panel_rounds),
      created_by,
    ];

    const result = await pool.query(query, values);
    const driveId = result.rows[0].drive_id;
    for (const huskyId of husky_ids) {
      await pool.query(
        "INSERT INTO drive_husky_ids (husky_id, drive_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [huskyId, driveId]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLastDrive = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM drives ORDER BY created_at DESC LIMIT 1"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No drive found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableHuskyIds = async (req, res) => {
  const { bu_id } = req.query;
  const result = await pool.query(
    `
    SELECT husky_id
    FROM bu_husky_ids
    WHERE bu_id = $1
    AND husky_id NOT IN (SELECT husky_id FROM drive_husky_ids)
    `,
    [bu_id]
  );
  res.json(result.rows);
};

// Get drive locations for filters
const getDriveLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT country, state, city, building FROM drives
    `);
    const countries = [
      ...new Set(result.rows.map((r) => r.country).filter(Boolean)),
    ];
    const states = [
      ...new Set(result.rows.map((r) => r.state).filter(Boolean)),
    ];
    const cities = [...new Set(result.rows.map((r) => r.city).filter(Boolean))];
    const buildings = [
      ...new Set(result.rows.map((r) => r.building).filter(Boolean)),
    ];
    res.json({ country: countries, state: states, city: cities, building: buildings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get drives/interviews with filters
const getDrives = async (req, res) => {
  try {
    let query = "SELECT * FROM drives WHERE 1=1";
    const params = [];
    if (req.query.country) {
      params.push(req.query.country);
      query += ` AND country = $${params.length}`;
    }
    if (req.query.state) {
      params.push(req.query.state);
      query += ` AND state = $${params.length}`;
    }
    if (req.query.city) {
      params.push(req.query.city);
      query += ` AND city = $${params.length}`;
    }
    if (req.query.building) {
      params.push(req.query.building);
      query += ` AND building = $${params.length}`;
    }
    if (req.query.status && req.query.status !== "All") {
      params.push(req.query.status);
      query += ` AND status = $${params.length}`;
    }
    if (req.query.mode_of_interview && req.query.mode_of_interview !== "All") {
      params.push(req.query.mode_of_interview);
      query += ` AND mode_of_interview = $${params.length}`;
    }
    if (req.query.from) {
      params.push(req.query.from);
      query += ` AND drive_date >= $${params.length}`;
    }
    if (req.query.to) {
      params.push(req.query.to);
      query += ` AND drive_date <= $${params.length}`;
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDrives = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT drive_id, drive_name, drive_date, no_of_panel_rounds FROM drives ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCandidatesForScheduling = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidate_info WHERE attendance_marked = TRUE ORDER BY attendance_marked_at ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getInterviewers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employee_info WHERE role = 'Colleague'"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRooms = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM interview_rooms");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPanels = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM panels");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const autoScheduleInterviews = async (req, res) => {
  // Inputs: rounds, slot duration, start time, etc. (can be passed in req.body)
  // For simplicity, let's assume 3 rounds, 30 min slots, 10am-5pm, and all data is fetched here

  try {
    const candidates = (
      await pool.query(
        "SELECT * FROM candidate_info WHERE attendance_marked = TRUE ORDER BY attendance_marked_at ASC"
      )
    ).rows;
    const interviewers = (
      await pool.query("SELECT * FROM employee_info WHERE role = 'Colleague'")
    ).rows;
    const rooms = (await pool.query("SELECT * FROM interview_rooms")).rows;
    const panels = (await pool.query("SELECT * FROM panels")).rows;

    const slotStart = new Date();
    slotStart.setHours(10, 0, 0, 0); // 10:00 AM
    const slotEnd = new Date();
    slotEnd.setHours(17, 0, 0, 0); // 5:00 PM
    const slotDuration = 30; // minutes

    let schedules = [];
    let timePointer = new Date(slotStart);

    for (const candidate of candidates) {
      for (let round = 1; round <= 3; round++) {
        // Find available interviewer, room, and panel for this round and time
        const interviewer = interviewers.find(
          (i) =>
            !schedules.some(
              (s) =>
                s.interviewer_id === i.employee_id &&
                s.scheduled_time.getTime() === timePointer.getTime()
            )
        );
        const room = rooms.find(
          (r) =>
            !schedules.some(
              (s) =>
                s.room_id === r.id &&
                s.scheduled_time.getTime() === timePointer.getTime()
            )
        );
        const panel = panels.find((p) => true); // pick any panel for now

        if (interviewer && room && panel) {
          schedules.push({
            candidate_token: candidate.candidate_token,
            round,
            interviewer_id: interviewer.employee_id,
            panel_id: panel.id,
            room_id: room.id,
            scheduled_time: new Date(timePointer),
            status: "Scheduled",
          });
        }

        // Move to next slot
        timePointer = new Date(timePointer.getTime() + slotDuration * 60000);
        if (timePointer >= slotEnd) {
          // Next day logic can be added here
          timePointer = new Date(slotStart);
        }
      }
    }

    // Save to DB
    for (const s of schedules) {
      await pool.query(
        `INSERT INTO interview_schedule
        (candidate_token, round, interviewer_id, panel_id, room_id, scheduled_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          s.candidate_token,
          s.round,
          s.interviewer_id,
          s.panel_id,
          s.room_id,
          s.scheduled_time,
          s.status,
        ]
      );
    }

    res.json({ message: "Auto-scheduling completed", count: schedules.length });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Auto-scheduling failed", error: err.message });
  }
};

const manualScheduleInterview = async (req, res) => {
  const {
    candidate_token,
    interview_level,
    panel_id,
    room_id,
    scheduled_time,
    drive_id,
  } = req.body;

  try {
    const query = `
      INSERT INTO interview_schedule 
      (candidate_token, interview_level, panel_id, room_id, scheduled_time, drive_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      candidate_token,
      interview_level,

      parseInt(panel_id),
      parseInt(room_id),
      scheduled_time,
      drive_id, // Should already be a proper ISO timestamp from frontend
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Interview scheduled successfully.",
      scheduled: result.rows[0],
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Failed to schedule interview." });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         s.*, 
         c.first_name, c.last_name, 
         r.meeting_room_number, 
         p.panel_name,
         f.feedback_status AS interviewer_feedback,
         s.feedback_from_candidate AS candidate_feedback
       FROM interview_schedule s
       JOIN candidate_info c ON s.candidate_token = c.candidate_token
       JOIN interview_rooms r ON s.room_id = r.id
       JOIN panels p ON s.panel_id = p.id
       LEFT JOIN interview_feedback f ON 
         f.candidate_token = s.candidate_token 
         AND f.interview_level = s.interview_level
         AND f.sent_to_ta = TRUE
       ORDER BY s.scheduled_time`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

const getAssignedPanelMembers = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT jsonb_array_elements_text(panel_members::jsonb) AS employee_id
FROM panels;
    `;
    const { rows } = await pool.query(query);
    const assignedIds = rows.map((row) => row.employee_id);
    res.json(assignedIds);
  } catch (error) {
    console.error("Error fetching assigned panel members:", error);
    res.status(500).json({ error: "Failed to fetch assigned panel members" });
  }
};

const getAssignedInterviewRoomIdsController = async (req, res) => {
  try {
    const ids = await getAssignedInterviewRoomIds();
    res.json(ids);
  } catch (err) {
    console.error("Error fetching assigned room IDs", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// In controllers/taControllers.js
const getAllPanels = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.panel_name, 
        p.interview_level, 
        p.panel_members, 
        p.interview_room_id,
        r.meeting_room_number
      FROM panels p
      LEFT JOIN interview_rooms r ON p.interview_room_id = r.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDrivePanelCandidateTable = async (req, res) => {
  try {
    // Build WHERE clause for filters
    const filters = [];
    const params = [];
    let idx = 1;

    // JOIN business_units for BU name
    if (req.query.bu) {
      filters.push(`bu.name = $${idx++}`);
      params.push(req.query.bu);
    }
    if (req.query.husky_id) {
      filters.push(`dh.husky_id = $${idx++}`);
      params.push(req.query.husky_id);
    }
    if (req.query.country) {
      filters.push(`d.country = $${idx++}`);
      params.push(req.query.country);
    }
    if (req.query.state) {
      filters.push(`d.state = $${idx++}`);
      params.push(req.query.state);
    }
    if (req.query.city) {
      filters.push(`d.city = $${idx++}`);
      params.push(req.query.city);
    }
    if (req.query.building) {
      filters.push(`d.building = $${idx++}`);
      params.push(req.query.building);
    }
    if (req.query.date) {
      filters.push(`d.drive_date = $${idx++}`);
      params.push(req.query.date);
    }
    if (req.query.drive_name) {
      filters.push(`d.drive_name = $${idx++}`);
      params.push(req.query.drive_name);
    }

    // Get max panel rounds for filtered drives
    const maxPanelRes = await pool.query(
      `SELECT MAX(no_of_panel_rounds) AS max_panel_rounds FROM drives d
       JOIN drive_husky_ids dh ON dh.drive_id = d.drive_id
       JOIN business_units bu ON d.bu_id = bu.id
       ${filters.length ? "WHERE " + filters.join(" AND ") : ""}
      `,
      params
    );
    const max_panel_rounds = Number(maxPanelRes.rows[0].max_panel_rounds) || 2;

    // Build dynamic SELECT for all panel rounds
    let selectPanels = "";
    for (let i = 1; i <= max_panel_rounds; i++) {
      selectPanels += `
        LEFT JOIN panels p${i} ON p${i}.drive_id = d.drive_id AND p${i}.interview_level = 'L${i}'
        LEFT JOIN interview_schedule s${i} ON s${i}.panel_id = p${i}.id AND s${i}.drive_id = d.drive_id
        LEFT JOIN candidate_info c${i} ON c${i}.candidate_token = s${i}.candidate_token
        LEFT JOIN interview_feedback f${i} ON f${i}.candidate_token = s${i}.candidate_token AND f${i}.interview_level = 'L${i}'
      `;
    }

    let selectFields = `
      d.drive_name AS drive_name,         -- Add this line
      bu.name AS bu,
      dh.husky_id,
      d.country,
      d.state,
      d.city,
      d.building,
      d.drive_date AS date
    `;
    // Add room_no from first panel (or you can make this dynamic per round)
    selectFields += `,
      (SELECT ir.meeting_room_number FROM interview_rooms ir WHERE ir.id = p1.interview_room_id) AS room_no
    `;
    for (let i = 1; i <= max_panel_rounds; i++) {
      selectFields += `,
        p${i}.panel_name AS l${i}_panel,
        s${i}.scheduled_time AS l${i}_slot,
        c${i}.first_name || ' ' || c${i}.last_name AS l${i}_candidate,
        s${i}.status AS l${i}_status,
        f${i}.feedback_status AS l${i}_feedback
      `;
    }

    // Main query
    const query = `
      SELECT ${selectFields}
      FROM drives d
      JOIN business_units bu ON d.bu_id = bu.id
      JOIN drive_husky_ids dh ON dh.drive_id = d.drive_id
      ${selectPanels}
      ${filters.length ? "WHERE " + filters.join(" AND ") : ""}
      ORDER BY d.drive_date DESC, dh.husky_id
    `;

    const result = await pool.query(query, params);

    res.json({ rows: result.rows, max_panel_rounds });
  } catch (err) {
    console.error("Error in getDrivePanelCandidateTable:", err);
    res.status(500).json({ message: "Failed to fetch table view" });
  }
};

module.exports = {
  getAssignmentsForBU,
  getAllInterviewRoomsController,
  getColleaguesController,
  createPanelController,
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
};
