const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true, trim: true },
    email:        { type: String, unique: true, sparse: true, lowercase: true, default: undefined },
    phone:        { type: String, unique: true, sparse: true, default: undefined },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["elderly", "caregiver", "admin"], default: "elderly" },
    age:          Number,
    gender:       String,
    timezone:     { type: String, default: "Asia/Kolkata" },
    language:     { type: String, default: "en" },
    medicalNotes: {
      diagnosis: String,
      allergies: [String],
    },
    caregiverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    elderlyIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    preferences: {
      voiceEnabled:           { type: Boolean, default: true },
      largeText:              { type: Boolean, default: true },
      highContrast:           { type: Boolean, default: true },
      reminderTone:           { type: String,  default: "gentle" },
      consentFaceRecognition: { type: Boolean, default: false },
      consentDataSharing:     { type: Boolean, default: true },
    },
    emergencyContacts: [
      {
        name:     String,
        relation: String,
        phone:    String,
      },
    ],
    pushSubscription: mongoose.Schema.Types.Mixed,
    refreshToken:     String,
    isActive:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Pre-save hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);

