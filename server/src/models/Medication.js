const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:         { type: String, required: true },
    dose:         { type: String, required: true },
    instructions: String,
    scheduleType: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
    times:        [{ type: String }], // ["08:00","20:00"]
    daysOfWeek:   [Number],          // 0=Sun … 6=Sat for weekly
    startDate:    Date,
    endDate:      Date,
    active:       { type: Boolean, default: true },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
