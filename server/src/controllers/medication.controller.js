const Medication    = require("../models/Medication");
const MedicationLog = require("../models/MedicationLog");
const asyncHandler  = require("../utils/asyncHandler");

// POST /api/medications
exports.createMedication = asyncHandler(async (req, res) => {
  const med = await Medication.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, medication: med });
});

// GET /api/medications/:userId
exports.getMedications = asyncHandler(async (req, res) => {
  const meds = await Medication.find({ userId: req.params.userId, active: true });
  res.json({ success: true, medications: meds });
});

// PUT /api/medications/:medicationId
exports.updateMedication = asyncHandler(async (req, res) => {
  const med = await Medication.findByIdAndUpdate(req.params.medicationId, req.body, { new: true });
  if (!med) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, medication: med });
});

// DELETE /api/medications/:medicationId
exports.deleteMedication = asyncHandler(async (req, res) => {
  await Medication.findByIdAndUpdate(req.params.medicationId, { active: false });
  res.json({ success: true, message: "Medication deactivated" });
});

// POST /api/medications/:medicationId/confirm
exports.confirmMedication = asyncHandler(async (req, res) => {
  const { mode } = req.body; // voice | button | caregiver
  const log = await MedicationLog.findOneAndUpdate(
    { medicationId: req.params.medicationId, status: "pending" },
    { status: "taken", confirmedAt: new Date(), confirmationMode: mode || "button" },
    { new: true }
  );
  if (!log) return res.status(404).json({ success: false, message: "No pending log found" });
  res.json({ success: true, log });
});

// GET /api/medications/:userId/logs
exports.getMedicationLogs = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const logs = await MedicationLog.find({
    userId: req.params.userId,
    scheduledTime: { $gte: today },
  }).populate("medicationId", "name dose");
  res.json({ success: true, logs });
});
