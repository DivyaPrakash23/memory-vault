require("dotenv").config();
const http = require("http");
const app  = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const { startMedicineReminderJob } = require("./jobs/medicineReminder.job");
const { startAnomalyCheckJob } = require("./jobs/anomalyCheck.job");
const { startInactivityCheckJob } = require("./jobs/inactivityCheck.job");

const PORT = process.env.PORT || 5000;

// 🔥 Global error handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  // ✅ Run jobs only in production
  if (process.env.NODE_ENV === "production") {
    startMedicineReminderJob();
    startAnomalyCheckJob();
    startInactivityCheckJob();
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});

// 🔥 Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});