const pool = require("../config/db");

// Get scheduled interviews for an interviewer (panel member)
const getScheduledInterviews = async (req, res) => {
  const { employee_id } = req.query;
  try {
    // Find panels where this employee is a member
    const panelsRes = await pool.query(
      `SELECT id FROM panels WHERE panel_members::jsonb @> to_jsonb($1::text)`,
      [employee_id]
    );
    const panelIds = panelsRes.rows.map((p) => p.id);
    if (panelIds.length === 0) return res.json([]);

    // Get scheduled interviews for these panels
    const result = await pool.query(
      `SELECT 
        s.id,
        s.candidate_token,
        c.first_name,
        c.last_name,
        s.interview_level,
        s.scheduled_time,
        r.meeting_room_number AS room_no,
        s.panel_id,
        s.status
      FROM interview_schedule s
      JOIN candidate_info c ON s.candidate_token = c.candidate_token
      JOIN interview_rooms r ON s.room_id = r.id
      WHERE s.panel_id = ANY($1)
      ORDER BY s.scheduled_time`,
      [panelIds]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save feedbacks from interviewer dashboard
const saveInterviewFeedback = async (req, res) => {
  const { feedbacks } = req.body;
  if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
    return res.status(400).json({ message: "No feedbacks provided." });
  }
  try {
    for (const fb of feedbacks) {
      await pool.query(
        `INSERT INTO interview_feedback 
          (candidate_token, interviewer_id, time_slot, room_no, interview_level, status, candidate_status, feedback_status, sent_to_ta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)`,
        [
          fb.candidate_token,
          fb.interviewer_id,
          fb.scheduled_time,
          fb.room_no,
          fb.interview_level,
          fb.interview_status,
          fb.candidate_status,
          fb.feedback_status,
        ]
      );
      await pool.query(
        `UPDATE interview_schedule SET status = $1, result = $2 WHERE id = $3`,
        [fb.interview_status, fb.candidate_status, fb.schedule_id]
      );

      // --- Add this block to notify candidate about result ---
      let resultMsg = "";
      if (fb.candidate_status === "Selected") {
        resultMsg = "Congratulations! You have been selected in the interview.";
      } else if (fb.candidate_status === "Rejected") {
        resultMsg = "We regret to inform you that you were not selected.";
      } else if (fb.candidate_status === "On hold") {
        resultMsg = "Your interview result is on hold. Please wait for further updates.";
      }
      if (resultMsg) {
        await pool.query(
          `INSERT INTO notifications (candidate_token, message) VALUES ($1, $2)`,
          [fb.candidate_token, resultMsg]
        );
      }
      // --- End notification block ---
    }
    res.json({ message: "Feedback sent to TA successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update interview status and feedback
const updateInterviewStatus = async (req, res) => {
  const { schedule_id, status } = req.body;
  try {
    // Update interview status
    await pool.query(
      `UPDATE interview_schedule SET status = $1 WHERE id = $2`,
      [status, schedule_id]
    );

    // Fetch candidate_token for this schedule
    const result = await pool.query(
      `SELECT candidate_token FROM interview_schedule WHERE id = $1`,
      [schedule_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    const candidate_token = result.rows[0].candidate_token;

    // Compose notification message
    let message = "";
    if (status === "Started") {
      message = "Your interview has started.";
    } else if (status === "Finished") {
      message = "Your interview has finished. Please provide your feedback.";
    } else {
      message = `Interview status updated to ${status}.`;
    }

    // Insert notification
    await pool.query(
      `INSERT INTO notifications (candidate_token, message) VALUES ($1, $2)`,
      [candidate_token, message]
    );

    res.json({ message: "Interview status updated and notification sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getScheduledInterviews,
  saveInterviewFeedback,
  updateInterviewStatus,
};
