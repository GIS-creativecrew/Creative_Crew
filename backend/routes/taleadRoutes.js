const express = require("express");
const router = express.Router();
const { assignToBU, getAssigned } = require("../controllers/taleadController");

router.post("/assign-bu", assignToBU);
router.get("/assigned", getAssigned);

module.exports = router;