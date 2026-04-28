const cron = require("node-cron");
const { processDueReminders, processMissedMedications } = require("../services/reminder.service");

const startMedicineReminderJob = () => {
  // Every minute: check for due medications
  cron.schedule("* * * * *", async () => {
    try {
      await processDueReminders();
    } catch (err) {
      console.error("Medicine reminder job error:", err.message);
    }
  });

  // Every 10 minutes: mark no-response as missed + escalate
  cron.schedule("*/10 * * * *", async () => {
    try {
      await processMissedMedications();
    } catch (err) {
      console.error("Missed med job error:", err.message);
    }
  });

  console.log("✅ Medicine reminder jobs started");
};

module.exports = { startMedicineReminderJob };

