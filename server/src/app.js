require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.set("trust proxy", 1);

// ── Security ─────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));

if (process.env.NODE_ENV === "production") {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  }));
}

// ── Parsing ──────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Health ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health", (_, res) =>
  res.json({ status: "ok", time: new Date() })
);

// ── Routes ───────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/medications", require("./routes/medication.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/activity-logs", require("./routes/activityLog.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/journal", require("./routes/journal.routes"));
app.use("/api/alerts", require("./routes/alert.routes"));
app.use("/api/faces", require("./routes/face.routes"));
app.use("/api/family", require("./routes/family.routes"));
app.use("/api/tests", require("./routes/test.routes"));

// ── Error Handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;