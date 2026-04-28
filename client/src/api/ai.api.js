import api from "./axios";
export const aiAPI = {
  askMemory:      (payload) => api.post("/ai/ask-memory", payload),
  chat:           (payload) => api.post("/ai/chat", payload),
  parseVoice:     (command, userId) => api.post("/ai/parse-voice-command", { command, userId }),
  summarizeDay:   (payload) => api.post("/ai/summarize-day", payload),
  caregiverReport:(userId) => api.post("/ai/caregiver-report", { userId }),
};