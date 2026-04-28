const ActivityLog    = require("../models/ActivityLog");
const Conversation   = require("../models/Conversation");
const asyncHandler   = require("../utils/asyncHandler");
const {
  generateMemorySummary,
  chatWithAssistant,
  parseVoiceCommand,
  generateMemoryCaption,
  generateCaregiverSummary,
} = require("../services/gemini.service");

// POST /api/ai/ask-memory
exports.askMemory = asyncHandler(async (req, res) => {
  const { userId, question, dateRange } = req.body;

  const logs = await ActivityLog.find({
    userId,
    occurredAt: { $gte: new Date(dateRange.start), $lte: new Date(dateRange.end) },
  }).sort("occurredAt");

  const summary = await generateMemorySummary({ question, logs });

  // Log the question as activity
  await ActivityLog.create({
    userId,
    type:      "confusion_question",
    value:     question,
    metadata:  { source: "ai_memory" },
    occurredAt: new Date(),
  });

  res.json({ success: true, summary, logsCount: logs.length });
});

// POST /api/ai/chat
exports.chat = asyncHandler(async (req, res) => {
  const { userId, message, sessionId } = req.body;

  // Fetch last 5 conversations for context
  const recent = await Conversation.find({ userId }).sort("-createdAt").limit(5);
  const recentContext = recent
    .reverse()
    .map((c) => `${c.speaker}: ${c.text}`)
    .join("\n");

  const reply = await chatWithAssistant({ userMessage: message, recentContext });

  // Save both turns
  const sid = sessionId || `session_${Date.now()}`;
  await Conversation.create([
    { userId, sessionId: sid, speaker: "user",      text: message },
    { userId, sessionId: sid, speaker: "assistant",  text: reply  },
  ]);

  res.json({ success: true, reply });
});

// POST /api/ai/parse-voice-command
exports.parseVoiceCommand = asyncHandler(async (req, res) => {
  const { command, userId } = req.body;
  const parsed = await parseVoiceCommand(command);
  res.json({ success: true, ...parsed });
});

// POST /api/ai/summarize-day
exports.summarizeDay = asyncHandler(async (req, res) => {
  const { userId, date } = req.body;
  const start = new Date(date); start.setHours(0,0,0,0);
  const end   = new Date(date); end.setHours(23,59,59,999);

  const logs = await ActivityLog.find({
    userId,
    occurredAt: { $gte: start, $lte: end },
  }).sort("occurredAt");

  const summary = await generateMemorySummary({
    question: "Give a complete summary of everything that happened today.",
    logs,
  });

  res.json({ success: true, summary });
});

// POST /api/ai/generate-memory-caption
exports.generateCaption = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const caption = await generateMemoryCaption(title);
  res.json({ success: true, caption });
});

// POST /api/ai/caregiver-report
exports.caregiverReport = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const Alert       = require("../models/Alert");
  const MedLog      = require("../models/MedicationLog");
  const CogTest     = require("../models/CognitiveTest");

  const today = new Date(); today.setHours(0,0,0,0);

  const [alerts, missedMeds, confusionCount, testScores] = await Promise.all([
    Alert.countDocuments({ userId, resolved: false }),
    MedLog.countDocuments({ userId, status: "missed", scheduledTime: { $gte: today } }),
    ActivityLog.countDocuments({ userId, type: "confusion_question", occurredAt: { $gte: today } }),
    CogTest.find({ userId }).sort("-takenAt").limit(5).then((t) => t.map((s) => s.score / s.maxScore)),
  ]);

  const summary = await generateCaregiverSummary({ userId, alerts, missedMeds, confusionCount, testScores });
  res.json({ success: true, summary });
});
