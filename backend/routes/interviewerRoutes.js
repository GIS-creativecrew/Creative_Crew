const express = require("express");
const router = express.Router();
const {
  saveInterviewFeedback,
  getScheduledInterviews,
  updateInterviewStatus,
} = require("../controllers/interviewerController");

router.get("/scheduled-interviews", getScheduledInterviews);
router.post("/send-feedback", saveInterviewFeedback);
router.post("/update-status", updateInterviewStatus);

module.exports = router;
