const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  buildMemorySummaryPrompt,
  buildChatPrompt,
  buildCaptionPrompt,
} = require("../prompts/memory.prompt");
const { buildVoiceCommandPrompt } = require("../prompts/voice.prompt");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(prompt) {
  try {
    // CHANGE THIS LINE - use a current model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",  // ✅ Working model
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return result.response.text();

  } catch (err) {
    console.error("AI ERROR:", err?.response?.data || err);
    throw err;
  }
}

// Rest of your functions remain the same...
async function generateMemorySummary({ question, logs }) {
  const prompt = buildMemorySummaryPrompt({ question, logs });
  return await callGemini(prompt);
}

async function chatWithAssistant({ userMessage, recentContext }) {
  const prompt = buildChatPrompt({ userMessage, recentContext });
  return await callGemini(prompt);
}

async function parseVoiceCommand(command) {
  const prompt = buildVoiceCommandPrompt(command);
  const raw    = await callGemini(prompt);
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { intent: "UNKNOWN", entities: {}, confidence: 0 };
  }
}

async function generateMemoryCaption(title) {
  const prompt = buildCaptionPrompt(title);
  return await callGemini(prompt);
}

async function generateCaregiverSummary({ userId, alerts, missedMeds, confusionCount, testScores }) {
  const prompt = `
You are a caregiver report assistant.

Generate a brief daily summary (under 120 words) for the caregiver of user ${userId}.

Data:
- Unresolved alerts: ${alerts}
- Medicines missed today: ${missedMeds}
- Confusion-related questions today: ${confusionCount}
- Recent cognitive test scores: ${JSON.stringify(testScores)}

Write in professional, plain English. Highlight key concerns if any.
Use a calm and factual tone.
`.trim();

  return await callGemini(prompt);
}

module.exports = {
  generateMemorySummary,
  chatWithAssistant,
  parseVoiceCommand,
  generateMemoryCaption,
  generateCaregiverSummary,
};