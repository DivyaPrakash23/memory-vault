const Appointment  = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");

exports.createAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, appointment: appt });
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const appts = await Appointment.find({ userId: req.params.userId }).sort("startTime");
  res.json({ success: true, appointments: appts });
});

exports.getTodayAppointments = asyncHandler(async (req, res) => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);
  const appts = await Appointment.find({
    userId:    req.params.userId,
    startTime: { $gte: start, $lte: end },
  }).sort("startTime");
  res.json({ success: true, appointments: appts });
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!appt) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, appointment: appt });
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Appointment deleted" });
});