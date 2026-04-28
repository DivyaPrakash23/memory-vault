const mongoose = require("mongoose");

const anomalyScoreSchema = new mongoose.Schema(
  {
    userId:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date:              { type: Date, required: true },
    missedMeds:        { type: Number, default: 0 },
    confusionCount:    { type: Number, default: 0 },
    inactivityHours:   { type: Number, default: 0 },
    nightInteractions: { type: Number, default: 0 },
    avgRecallScore:    { type: Number, default: 0 },
    riskScore:         { type: Number, default: 0 },
    riskLevel:         { type: String, enum: ["normal","moderate","high"], default: "normal" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnomalyScore", anomalyScoreSchema);