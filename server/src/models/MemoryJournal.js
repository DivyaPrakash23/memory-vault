const mongoose = require("mongoose");

const memoryJournalSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:      { type: String, required: true },
    photoUrl:   String,
    caption:    String, // AI-generated
    tags:       [String],
    memoryDate: Date,
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MemoryJournal", memoryJournalSchema);