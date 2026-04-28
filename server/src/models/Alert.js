const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId:               { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["missed_medicine","inactivity","repeated_confusion","unusual_behavior","mood_drop","sleep_disruption"],
      required: true,
    },
    severity:             { type: String, enum: ["low","medium","high"], default: "medium" },
    message:              { type: String, required: true },
    resolved:             { type: Boolean, default: false },
    notifiedCaregiverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resolvedAt:           Date,
    resolvedBy:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, resolved: 1 });

module.exports = mongoose.model("Alert", alertSchema);