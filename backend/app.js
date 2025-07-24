require("dotenv").config(); // <-- Add this as the first line

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const taRoutes = require("./routes/taRoutes");
const taleadRoutes = require("./routes/taleadRoutes");
const buRoutes = require("./routes/buRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const interviewerRoutes = require("./routes/interviewerRoutes");

const app = express();
app.use(
  cors({
    origin: "FRONTEND_URL",
    credentials: true, // Allow cookies to be sent
  })
);
app.use(bodyParser.json());

app.use(
  session({
    secret: "mySuper$ecretKey123!@#", // <-- Use a strong, random string here!
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use("/api/employees", signupRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/ta", taRoutes);
app.use("/api/talead", taleadRoutes);
app.use("/api/bu", buRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviewer", interviewerRoutes);

module.exports = app;
  
