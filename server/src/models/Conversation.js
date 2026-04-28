const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId:  { type: String, required: true },
    speaker:    { type: String, enum: ["user","assistant"], required: true },
    text:       { type: String, required: true },
    intent:     String,
    emotionTag: String,
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);