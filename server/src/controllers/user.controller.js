const User         = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -refreshToken");
  if (!user) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { passwordHash, role, ...updates } = req.body; // prevent role/password change here
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
    .select("-passwordHash -refreshToken");
  res.json({ success: true, user });
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { preferences: req.body },
    { new: true }
  ).select("preferences");
  res.json({ success: true, preferences: user.preferences });
});

exports.savePushSubscription = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { pushSubscription: req.body.subscription });
  res.json({ success: true, message: "Push subscription saved" });
});