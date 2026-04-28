const Medication        = require("../models/Medication");
const MedicationLog     = require("../models/MedicationLog");
const { sendReminderToUser, escalateToCaregivers } = require("./notification.service");

// Check all active medications and fire reminders for those due now
async function processDueReminders() {
  const now   = new Date();
  const hhmm  = now.toTimeString().slice(0, 5); // "HH:MM"
  const today = new Date(now); today.setHours(0,0,0,0);
  const end   = new Date(now); end.setHours(23,59,59,999);

  const meds = await Medication.find({ active: true, times: hhmm });

  for (const med of meds) {
    const alreadyLogged = await MedicationLog.findOne({
      medicationId:  med._id,
      scheduledTime: { $gte: today, $lte: end },
    });

    if (!alreadyLogged) {
      await MedicationLog.create({
        medicationId:  med._id,
        userId:        med.userId,
        scheduledTime: new Date(),
        status:        "pending",
      });

      await sendReminderToUser(med.userId, {
        type:  "medicine_reminder",
        title: "Medicine Reminder",
        body:  `Time to take ${med.name} — ${med.dose}. ${med.instructions || ""}`,
        medicationId: med._id.toString(),
      });
    }
  }
}

// Mark pending meds that have passed 30-min threshold as missed + escalate
async function processMissedMedications() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago

  const pending = await MedicationLog.find({
    status:        "pending",
    scheduledTime: { $lte: cutoff },
  }).populate("medicationId");

  for (const log of pending) {
    log.status = "missed";
    await log.save();

    const message = `${log.medicationId?.name || "Medicine"} was not confirmed.`;
    await escalateToCaregivers(log.userId, message);
  }
}

module.exports = { processDueReminders, processMissedMedications };