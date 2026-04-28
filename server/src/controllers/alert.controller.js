const Alert        = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");

exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ userId: req.params.userId, resolved: false }).sort("-createdAt");
  res.json({ success: true, alerts });
});

exports.resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { resolved: true, resolvedAt: new Date(), resolvedBy: req.user._id },
    { new: true }
  );
  if (!alert) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, alert });
});