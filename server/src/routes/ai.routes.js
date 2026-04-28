const router = require("express").Router();
const {
  askMemory, chat, parseVoiceCommand,
  summarizeDay, generateCaption, caregiverReport,
} = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/ask-memory",              askMemory);
router.post("/chat",                    chat);
router.post("/parse-voice-command",     parseVoiceCommand);
router.post("/summarize-day",           summarizeDay);
router.post("/generate-memory-caption", generateCaption);
router.post("/caregiver-report",        caregiverReport);

module.exports = router;