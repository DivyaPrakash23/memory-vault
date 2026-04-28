const FamilyMember = require("../models/FamilyMember");
const asyncHandler = require("../utils/asyncHandler");

exports.createFamilyMember = asyncHandler(async (req, res) => {
  const member = await FamilyMember.create({ ...req.body });
  res.status(201).json({ success: true, member });
});

exports.getFamilyMembers = asyncHandler(async (req, res) => {
  const members = await FamilyMember.find({ userId: req.params.userId });
  res.json({ success: true, members });
});

exports.updateFamilyMember = asyncHandler(async (req, res) => {
  const member = await FamilyMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!member) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, member });
});

exports.deleteFamilyMember = asyncHandler(async (req, res) => {
  await FamilyMember.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});

exports.logVisit = asyncHandler(async (req, res) => {
  const member = await FamilyMember.findByIdAndUpdate(
    req.params.id,
    { lastVisitAt: new Date() },
    { new: true }
  );
  res.json({ success: true, member });
});