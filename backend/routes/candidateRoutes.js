const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/candidateController");

router.post("/register", registerCandidate);
router.post("/register-bulk", registerCandidatesBulk);
router.post("/login", loginCandidate);
router.get("/profile", getCandidateProfile);
router.get("/list", getAllCandidates);
router.post("/send-registration-emails", sendRegistrationEmails);
router.get("/interviews", getCandidateInterviews);
router.get("/notifications", getCandidateNotifications);
router.post("/feedback", saveCandidateFeedback);
router.post("/notifications/read", markNotificationsRead);

module.exports = router;
