const ActivityLog  = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");

exports.createLog = asyncHandler(async (req, res) => {
  const log = await ActivityLog.create(req.body);
  res.status(201).json({ success: true, log });
});

exports.getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const filter = { userId: req.params.userId };
  if (type) filter.type = type;

  const logs = await ActivityLog.find(filter)
    .sort("-occurredAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, logs });
});

exports.getYesterdayLogs = asyncHandler(async (req, res) => {
  const now   = new Date();
  const start = new Date(now); start.setDate(now.getDate() - 1); start.setHours(0,0,0,0);
  const end   = new Date(start); end.setHours(23,59,59,999);

  const logs = await ActivityLog.find({
    userId:    req.params.userId,
    occurredAt: { $gte: start, $lte: end },
  }).sort("occurredAt");

  res.json({ success: true, logs });
});