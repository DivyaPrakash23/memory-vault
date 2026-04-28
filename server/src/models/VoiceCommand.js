const mongoose = require("mongoose");

const voiceCommandSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rawText:    { type: String, required: true },
    intent:     String,
    entities:   mongoose.Schema.Types.Mixed,
    confidence: Number,
    response:   String,
    action:     String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceCommand", voiceCommandSchema);






