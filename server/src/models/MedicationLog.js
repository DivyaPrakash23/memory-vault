const mongoose = require("mongoose");

const medicationLogSchema = new mongoose.Schema(
  {
    medicationId:     { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledTime:    { type: Date, required: true },
    confirmedAt:      Date,
    status:           { type: String, enum: ["pending","taken","missed","skipped"], default: "pending" },
    confirmationMode: { type: String, enum: ["voice","button","caregiver"], default: "button" },
    notes:            String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicationLog", medicationLogSchema);