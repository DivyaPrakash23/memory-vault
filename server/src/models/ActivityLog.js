const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["meal","visit","task","confusion_question","mood","note","wake_event","hydration","exercise","sleep"],
      required: true,
    },
    value:    String,
    metadata: {
      visitorName: String,
      moodScore:   Number, // 1–5
      source:      String, // voice | manual | auto
      extra:       mongoose.Schema.Types.Mixed,
    },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, occurredAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);