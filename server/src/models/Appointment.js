const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:           { type: String, required: true },
    description:     String,
    location:        String,
    startTime:       { type: Date, required: true },
    endTime:         Date,
    reminderOffsets: [Number], // minutes before, e.g. [60, 15]
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source:          { type: String, enum: ["manual","google_calendar"], default: "manual" },
    googleEventId:   String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);