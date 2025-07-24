const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/loginControllers");
const authenticateJWT = require("../middleware/auth");

router.post("/login", loginUser);

router.get("/me", authenticateJWT, (req, res) => {
  res.json(req.user); // This should be the full user object
});

router.post("/logout", (req, res) => {
  // JWT logout is handled on frontend by deleting the token
  res.json({ message: "Logged out" });
});

module.exports = router;
