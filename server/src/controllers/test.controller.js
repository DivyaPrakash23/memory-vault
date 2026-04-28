const CognitiveTest = require("../models/CognitiveTest");
const asyncHandler  = require("../utils/asyncHandler");

exports.submitTest = asyncHandler(async (req, res) => {
  const test = await CognitiveTest.create(req.body);
  res.status(201).json({ success: true, test });
});

exports.getTestTrends = asyncHandler(async (req, res) => {
  const tests = await CognitiveTest.find({ userId: req.params.userId })
    .sort("-takenAt")
    .limit(30);

  const trend = tests.map((t) => ({
    testType: t.testType,
    scorePercent: Math.round((t.score / t.maxScore) * 100),
    takenAt: t.takenAt,
  }));

  res.json({ success: true, trend });
});