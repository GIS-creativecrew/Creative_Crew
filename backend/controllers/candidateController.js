const {
  addCandidate,
  addCandidatesBulk,
} = require("../models/candidateModels");
const pool = require("../config/db");
const { sendCandidateRegistrationMail } = require("../utils/mailer");

const sendRegistrationEmails = async (req, res) => {
  try {
    // Get all candidates who haven't been sent an email
    const result = await pool.query(
      "SELECT * FROM candidate_info WHERE email_sent = FALSE"
    );
    const candidates = result.rows;
    let sentCount = 0;
    for (const candidate of candidates) {
      try {
        await sendCandidateRegistrationMail({
          email: candidate.email_id,
          token: candidate.candidate_token,
        });
        await pool.query(
          "UPDATE candidate_info SET email_sent = TRUE WHERE candidate_token = $1",
          [candidate.candidate_token]
        );
        sentCount++;
      } catch (err) {
        // Optionally log error for this candidate
      }
    }
    res.json({ message: `Emails sent to ${sentCount} candidates.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to send emails." });
  }
};

// Register single candidate
const registerCandidate = async (req, res) => {
  const { first_name, last_name, email_id, phone_number, applied_position } =
    req.body;
  if (!first_name || !last_name || !email_id || !phone_number) {
    return res
      .status(400)
      .json({ message: "All fields except applied_position are required." });
  }
  try {
    // Check for duplicate
    const exists = await pool.query(
      "SELECT 1 FROM candidate_info WHERE email_id = $1 OR phone_number = $2",
      [email_id, phone_number]
    );
    if (exists.rowCount > 0) {
      return res.status(409).json({ message: "Candidate already registered." });
    }
    const candidate = await addCandidate({
      first_name,
      last_name,
      email_id,
      phone_number,
      applied_position,
    });
    // Send email
    await sendCandidateRegistrationMail({
      email: email_id,
      token: candidate.candidate_token,
    });
    res.status(201).json({ candidate, emailSent: true });
  } catch (err) {
    res.status(400).json({ message: err.detail || err.message });
  }
};

// Register multiple candidates (Excel import)
const registerCandidatesBulk = async (req, res) => {
  const { candidates } = req.body;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ message: "Candidates array required." });
  }
  // Validate each candidate
  for (const c of candidates) {
    if (!c.first_name || !c.last_name || !c.email_id || !c.phone_number) {
      return res.status(400).json({
        message:
          "Each candidate must have first_name, last_name, email_id, phone_number.",
      });
    }
  }
  try {
    const inserted = [];
    for (const c of candidates) {
      // Check for duplicate
      const exists = await pool.query(
        "SELECT 1 FROM candidate_info WHERE email_id = $1 OR phone_number = $2",
        [c.email_id, c.phone_number]
      );
      if (exists.rowCount === 0) {
        const candidate = await addCandidate(c);
        await sendCandidateRegistrationMail({
          email: candidate.email_id,
          token: candidate.candidate_token,
        });
        inserted.push(candidate);
      }
    }
    res
      .status(201)
      .json({ insertedCount: inserted.length, inserted, emailSent: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Candidate login
const loginCandidate = async (req, res) => {
  const { email_id, phone_number, candidate_token } = req.body;
  if (!email_id || !phone_number || !candidate_token) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM candidate_info WHERE 
        email_id = $1 AND phone_number = $2 AND candidate_token = $3`,
      [email_id, phone_number, candidate_token]
    );
    if (result.rows.length === 1) {
      // Mark attendance as true and set time
      await pool.query(
        `UPDATE candidate_info SET attendance_marked = TRUE, attendance_marked_at = NOW() WHERE candidate_token = $1`,
        [candidate_token]
      );
      // Return updated candidate
      const updated = await pool.query(
        `SELECT * FROM candidate_info WHERE candidate_token = $1`,
        [candidate_token]
      );
      return res
        .status(200)
        .json({ message: "Login successful", candidate: updated.rows[0] });
    } else {
      return res.status(401).json({ message: "Invalid candidate details" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get candidate profile
const getCandidateProfile = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token required" });
  try {
    const result = await pool.query(
      "SELECT * FROM candidate_info WHERE candidate_token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidate_info ORDER BY attendance_marked_at DESC NULLS LAST, first_name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get candidate's scheduled interviews
const getCandidateInterviews = async (req, res) => {
  const { token } = req.query;
  try {
    const result = await pool.query(
      `SELECT s.id, s.interview_level, s.scheduled_time, r.meeting_room_number, s.status, s.result
       FROM interview_schedule s
       JOIN interview_rooms r ON s.room_id = r.id
       WHERE s.candidate_token = $1
       ORDER BY s.scheduled_time`,
      [token]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get candidate notifications (simple example)
const getCandidateNotifications = async (req, res) => {
  const { token } = req.query;
  try {
    const result = await pool.query(
      `SELECT message, created_at, read FROM notifications WHERE candidate_token = $1 ORDER BY created_at DESC LIMIT 10`,
      [token]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Save candidate feedback
const saveCandidateFeedback = async (req, res) => {
  const { candidate_token, schedule_id, feedback } = req.body;
  if (!candidate_token || !schedule_id || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    // Check if interview is finished
    const statusRes = await pool.query(
      `SELECT status FROM interview_schedule WHERE id = $1 AND candidate_token = $2`,
      [schedule_id, candidate_token]
    );
    if (!statusRes.rows.length || statusRes.rows[0].status !== "Finished") {
      return res.status(400).json({ message: "Interview not finished yet." });
    }

    // Save feedback in interview_schedule
    await pool.query(
      `UPDATE interview_schedule SET feedback_from_candidate = $1 WHERE id = $2`,
      [feedback, schedule_id]
    );

    res.json({ message: "Feedback saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notifications as read
const markNotificationsRead = async (req, res) => {
  const { candidate_token } = req.body;
  try {
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE candidate_token = $1 AND read = FALSE`,
      [candidate_token]
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerCandidate,
  registerCandidatesBulk,
  loginCandidate,
  getCandidateProfile,
  getAllCandidates,
  sendRegistrationEmails,
  getCandidateInterviews,
  getCandidateNotifications,
  saveCandidateFeedback,
  markNotificationsRead,
};
