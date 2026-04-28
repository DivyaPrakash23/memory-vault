const asyncHandler  = require("../utils/asyncHandler");
const { saveFaceDescriptor, getFaceProfiles, deleteFaceProfile } = require("../services/face.service");

exports.registerFace = asyncHandler(async (req, res) => {
  const { userId, familyMemberId, label, descriptor, sampleImageUrl } = req.body;
  const profile = await saveFaceDescriptor({ userId, familyMemberId, label, descriptor, sampleImageUrl });
  res.status(201).json({ success: true, profile });
});

exports.getFaces = asyncHandler(async (req, res) => {
  const profiles = await getFaceProfiles(req.params.userId);
  res.json({ success: true, profiles });
});

exports.deleteFace = asyncHandler(async (req, res) => {
  await deleteFaceProfile(req.params.id, req.user._id);
  res.json({ success: true, message: "Face profile deleted" });
});