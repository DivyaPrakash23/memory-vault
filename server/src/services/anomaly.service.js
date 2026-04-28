const ActivityLog    = require("../models/ActivityLog");
const MedicationLog  = require("../models/MedicationLog");
const CognitiveTest  = require("../models/CognitiveTest");
const Alert          = require("../models/Alert");
const AnomalyScore   = require("../models/AnomalyScore");
const { escalateToCaregivers } = require("./notification.service");

// Rule-based risk score
const calcRiskScore = ({ missedMeds, confusionCount, inactivityHours, nightInteractions, avgRecallScore }) =>
  missedMeds * 3 + confusionCount * 2 + inactivityHours * 2 + nightInteractions * 2 - avgRecallScore;

const classifyRisk = (score) => {
  if (score >= 10) return "high";
  if (score >= 5)  return "moderate";
  return "normal";
};

async function runAnomalyChecks(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  // ── Count confusion questions today ──────────────────────────────────────
  const confusionCount = await ActivityLog.countDocuments({
    userId,
    type: "confusion_question",
    occurredAt: { $gte: today },
  });

  // ── Count missed meds today ───────────────────────────────────────────────
  const missedMeds = await MedicationLog.countDocuments({
    userId,
    status: "missed",
    scheduledTime: { $gte: today },
  });

  // ── Count night interactions (10 PM – 5 AM) ───────────────────────────────
  const nightStart = new Date(today); nightStart.setHours(22, 0, 0, 0);
  const nightEnd   = new Date(today); nightEnd.setHours(5,  0, 0, 0);
  const nightInteractions = await ActivityLog.countDocuments({
    userId,
    occurredAt: { $gte: nightEnd, $lte: now },
    $or: [
      { occurredAt: { $gte: nightStart } },
      { occurredAt: { $lte: nightEnd   } },
    ],
  });

  // ── Inactivity blocks (no log for 10+ hours during daytime) ──────────────
  const logsToday = await ActivityLog.find({ userId, occurredAt: { $gte: today } }).sort("occurredAt");
  let inactivityHours = 0;
  if (logsToday.length < 2) {
    const elapsed = (now - today) / 3600000;
    if (elapsed > 10) inactivityHours = elapsed;
  }

  // ── Average recent cognitive test recall score ────────────────────────────
  const tests = await CognitiveTest.find({ userId }).sort("-takenAt").limit(5);
  const avgRecallScore = tests.length
    ? tests.reduce((a, t) => a + t.score / t.maxScore, 0) / tests.length * 10
    : 5;

  const riskScore = calcRiskScore({ missedMeds, confusionCount, inactivityHours, nightInteractions, avgRecallScore });
  const riskLevel = classifyRisk(riskScore);

  // ── Save anomaly score record ─────────────────────────────────────────────
  await AnomalyScore.findOneAndUpdate(
    { userId, date: today },
    { missedMeds, confusionCount, inactivityHours, nightInteractions, avgRecallScore, riskScore, riskLevel },
    { upsert: true, new: true }
  );

  // ── Create alerts and escalate if needed ─────────────────────────────────
  if (confusionCount >= 5) {
    await Alert.create({
      userId,
      type: "repeated_confusion",
      severity: "medium",
      message: `User asked confusion-related questions ${confusionCount} times today.`,
    });
  }

  if (missedMeds >= 2) {
    const alert = await Alert.create({
      userId,
      type: "missed_medicine",
      severity: "high",
      message: `User missed medicine ${missedMeds} times today.`,
    });
    await escalateToCaregivers(userId, alert.message);
  }

  if (inactivityHours >= 10) {
    await Alert.create({
      userId,
      type: "inactivity",
      severity: "high",
      message: `No activity detected for over ${Math.round(inactivityHours)} hours today.`,
    });
    await escalateToCaregivers(userId, `No activity for ${Math.round(inactivityHours)} hours.`);
  }

  return { riskScore, riskLevel, missedMeds, confusionCount };
}

module.exports = { runAnomalyChecks };
