const buildVoiceCommandPrompt = (command) => `
Convert the following voice command from an elderly user into a JSON object.

Allowed intents:
- GET_TODAY_DATE
- GET_YESTERDAY_SUMMARY
- GET_TODAY_SCHEDULE
- GET_NEXT_MEDICINE
- ADD_REMINDER
- MEDICINE_CONFIRMATION
- FIND_NOTE
- CALL_CONTACT
- GET_WEATHER
- UNKNOWN

User command:
"${command}"

Return ONLY valid JSON, no markdown, no explanation:
{
  "intent": "...",
  "entities": {},
  "confidence": 0.0
}
`.trim();

module.exports = { buildVoiceCommandPrompt };