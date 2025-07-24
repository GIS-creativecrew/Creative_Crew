const express = require("express");
const router = express.Router();
const { signupEmployee, changePassword, getProfile } = require("../controllers/signupControllers");

router.post("/signup", signupEmployee);
router.post("/change-password", changePassword);
router.get("/profile", getProfile);

module.exports = router;
