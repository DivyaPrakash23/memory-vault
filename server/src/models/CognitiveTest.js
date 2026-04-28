const mongoose = require("mongoose");

const cognitiveTestSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testType: {
      type: String,
      enum: ["recall_3_objects","identify_day","sequence_memory","visual_matching","reaction_test"],
      required: true,
    },
    score:           { type: Number, required: true },
    maxScore:        { type: Number, required: true },
    durationSeconds: Number,
    metadata: {
      answers:  [String],
      expected: [String],
      extra:    mongoose.Schema.Types.Mixed,
    },
    takenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CognitiveTest", cognitiveTestSchema);