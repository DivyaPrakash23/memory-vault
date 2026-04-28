const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:        { type: String, required: true },
    relation:    { type: String, required: true },
    phone:       String,
    lastVisitAt: Date,
    memoryNotes: String,
    photoUrl:    String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyMember", familyMemberSchema);

