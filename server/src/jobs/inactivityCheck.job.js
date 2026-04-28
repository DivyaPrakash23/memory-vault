const cron        = require("node-cron");
const User        = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const Alert       = require("../models/Alert");
const { escalateToCaregivers } = require("../services/notification.service");

const startInactivityCheckJob = () => {
  // Run at 2 PM every day — check for no daytime activity
  cron.schedule("0 14 * * *", async () => {
    try {
      const morningStart = new Date(); morningStart.setHours(6, 0, 0, 0);
      const now = new Date();

      const users = await User.find({ role: "elderly", isActive: true }).select("_id fullName");

      for (const user of users) {
        const activityCount = await ActivityLog.countDocuments({
          userId:    user._id,
          occurredAt: { $gte: morningStart, $lte: now },
        });

        if (activityCount === 0) {
          await Alert.create({
            userId:   user._id,
            type:     "inactivity",
            severity: "high",
            message:  "No activity recorded from 6 AM until 2 PM today.",
          });
          await escalateToCaregivers(user._id, `No app activity for ${user.fullName} since 6 AM.`);
        }
      }
    } catch (err) {
      console.error("Inactivity job error:", err.message);
    }
  });

  console.log("✅ Inactivity check job started");
};

module.exports = { startInactivityCheckJob };