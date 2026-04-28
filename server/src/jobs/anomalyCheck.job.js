const cron        = require("node-cron");
const User        = require("../models/User");
const { runAnomalyChecks } = require("../services/anomaly.service");

const startAnomalyCheckJob = () => {
  // Run once every hour for all elderly users
  cron.schedule("0 * * * *", async () => {
    try {
      const users = await User.find({ role: "elderly", isActive: true }).select("_id");
      for (const user of users) {
        await runAnomalyChecks(user._id);
      }
      console.log(`Anomaly check done for ${users.length} users`);
    } catch (err) {
      console.error("Anomaly job error:", err.message);
    }
  });

  console.log("✅ Anomaly check job started");
};

module.exports = { startAnomalyCheckJob };