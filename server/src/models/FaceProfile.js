const mongoose = require("mongoose");

const faceProfileSchema = new mongoose.Schema(
  {
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    familyMemberId:     { type: mongoose.Schema.Types.ObjectId, ref: "FamilyMember", required: true },
    label:              { type: String, required: true },
    descriptorEncrypted: { type: String, required: true }, // base64 encrypted float32 array
    sampleImageUrl:     String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FaceProfile", faceProfileSchema);