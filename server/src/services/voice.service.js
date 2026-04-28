/**
 * Voice Service
 * Orchestrates: raw speech text → Gemini intent parsing → action dispatch
 */

const { parseVoiceCommand } = require("./gemini.service");
const ActivityLog = require("../models/ActivityLog");

const INTENT_HANDLERS = {
  GET_TODAY_DATE: async () => {
    const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    return { response: `Today is ${today}.`, action: null };
  },

  GET_YESTERDAY_SUMMARY: async (userId) => {
    // Caller (AI controller) fetches logs + Gemini summary
    return { response: null, action: "FETCH_YESTERDAY_SUMMARY", userId };
  },

  GET_TODAY_SCHEDULE: async (userId) => {
    return { response: null, action: "FETCH_TODAY_SCHEDULE", userId };
  },

  GET_NEXT_MEDICINE: async (userId) => {
    return { response: null, action: "FETCH_NEXT_MEDICINE", userId };
  },

  MEDICINE_CONFIRMATION: async (userId) => {
    return { response: "I'll mark your medicine as taken.", action: "CONFIRM_MEDICINE", userId };
  },

  ADD_REMINDER: async (userId, entities) => {
    return { response: "Reminder noted.", action: "ADD_REMINDER", data: entities, userId };
  },

  UNKNOWN: async () => {
    return { response: "I didn't quite understand. Could you say that again?", action: null };
  },
};

async function processVoiceCommand(rawText, userId) {
  // 1. Parse intent via Gemini
  const parsed = await parseVoiceCommand(rawText);
  const { intent, entities, confidence } = parsed;

  // 2. Log the voice command as an activity
  await ActivityLog.create({
    userId,
    type:     "confusion_question",
    value:    rawText,
    metadata: { source: "voice", intent, confidence },
    occurredAt: new Date(),
  });

  // 3. Route to handler
  const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS["UNKNOWN"];
  const result  = await handler(userId, entities);

  return { intent, entities, confidence, ...result };
}

module.exports = { processVoiceCommand };
