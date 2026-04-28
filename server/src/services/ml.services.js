/**
 * ML Anomaly Scoring Service
 * Phase 1: Rule-based + statistical scoring (hackathon-ready)
 * Phase 2: Can swap in a TensorFlow.js model trained on historical behavior vectors
 *
 * Input vector: [missedMeds, confusionCount, inactivityHours, nightInteractions, avgRecallScore]
 * Output: { riskScore, riskLevel, breakdown }
 */

const AnomalyScore = require("../models/AnomalyScore");

/**
 * Compute a 14-day user baseline for z-score normalization
 */
async function getUserBaseline(userId) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const records = await AnomalyScore.find({
    userId,
    date: { $gte: cutoff },
  });

  if (records.length < 3) return null; // not enough history

  const avg = (field) =>
    records.reduce((s, r) => s + (r[field] || 0), 0) / records.length;

  const std = (field) => {
    const mean = avg(field);
    const variance =
      records.reduce((s, r) => s + Math.pow((r[field] || 0) - mean, 2), 0) /
      records.length;
    return Math.sqrt(variance);
  };

  return {
    missedMeds:        { mean: avg("missedMeds"),        std: std("missedMeds")        },
    confusionCount:    { mean: avg("confusionCount"),    std: std("confusionCount")    },
    inactivityHours:   { mean: avg("inactivityHours"),   std: std("inactivityHours")   },
    nightInteractions: { mean: avg("nightInteractions"), std: std("nightInteractions") },
    avgRecallScore:    { mean: avg("avgRecallScore"),     std: std("avgRecallScore")    },
  };
}

/**
 * Z-score of a value relative to a baseline metric
 */
function zScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

/**
 * Main scoring function
 */
async function computeAnomalyScore(userId, todayMetrics) {
  const {
    missedMeds        = 0,
    confusionCount    = 0,
    inactivityHours   = 0,
    nightInteractions = 0,
    avgRecallScore    = 5,
  } = todayMetrics;

  // --- Rule-based score (always available) ---
  const ruleScore =
    missedMeds        * 3 +
    confusionCount    * 2 +
    inactivityHours   * 2 +
    nightInteractions * 2 -
    avgRecallScore    * 0.5;

  // --- Statistical (z-score) enhancement if baseline exists ---
  const baseline = await getUserBaseline(userId);
  let mlScore = ruleScore;

  if (baseline) {
    const zMeds      = zScore(missedMeds,        baseline.missedMeds.mean,        baseline.missedMeds.std);
    const zConf      = zScore(confusionCount,    baseline.confusionCount.mean,    baseline.confusionCount.std);
    const zInact     = zScore(inactivityHours,   baseline.inactivityHours.mean,   baseline.inactivityHours.std);
    const zNight     = zScore(nightInteractions, baseline.nightInteractions.mean, baseline.nightInteractions.std);
    const zRecall    = zScore(avgRecallScore,    baseline.avgRecallScore.mean,    baseline.avgRecallScore.std);

    // Weighted z-score sum — higher z means more deviation from normal
    const zTotal = zMeds * 3 + zConf * 2 + zInact * 2 + zNight * 1.5 - zRecall;

    // Blend rule-based and z-score
    mlScore = ruleScore * 0.6 + zTotal * 2 * 0.4;
  }

  const riskLevel =
    mlScore >= 10 ? "high" :
    mlScore >= 5  ? "moderate" :
                    "normal";

  return {
    riskScore: Math.round(mlScore * 10) / 10,
    riskLevel,
    breakdown: {
      missedMeds, confusionCount, inactivityHours, nightInteractions, avgRecallScore,
      baselineAvailable: !!baseline,
    },
  };
}

module.exports = { computeAnomalyScore, getUserBaseline };

