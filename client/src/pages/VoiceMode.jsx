import { useState } from "react";
import { useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import VoiceCapture from "../components/voice/VoiceCapture";
import { aiAPI }   from "../api/ai.api";
import { appointmentAPI } from "../api/appointment.api";
import { medicationAPI }  from "../api/medication.api";

export default function VoiceMode() {
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);

  const addMsg = (speaker, text) =>
    setMessages((p) => [...p, { speaker, text, id: Date.now() + Math.random() }]);

  const handleCommand = async (transcript, speak) => {
    addMsg("user", transcript);

    // Parse intent
    const { data: parsed } = await aiAPI.parseVoice(transcript, user._id);
    const { intent } = parsed;

    let response = "I'm not sure how to help with that. Could you try again?";

    if (intent === "GET_TODAY_DATE") {
      response = `Today is ${new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })}.`;

    } else if (intent === "GET_YESTERDAY_SUMMARY") {
      const now   = new Date();
      const start = new Date(now); start.setDate(now.getDate()-1); start.setHours(0,0,0,0);
      const end   = new Date(start); end.setHours(23,59,59,999);
      const { data } = await aiAPI.askMemory({
        userId: user._id,
        question: "What happened yesterday?",
        dateRange: { start, end },
      });
      response = data.summary;

    } else if (intent === "GET_TODAY_SCHEDULE") {
      const { data } = await appointmentAPI.getToday(user._id);
      if (!data.appointments.length) {
        response = "You have no appointments today.";
      } else {
        response = "Today you have: " + data.appointments.map(
          (a) => `${a.title} at ${new Date(a.startTime).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}`
        ).join(", ");
      }

    } else if (intent === "GET_NEXT_MEDICINE") {
      const { data } = await medicationAPI.getLogs(user._id);
      const pending = data.logs.find((l) => l.status === "pending");
      response = pending
        ? `Your next medicine is ${pending.medicationId?.name} — ${pending.medicationId?.dose}.`
        : "All your medicines for today are confirmed. Great job!";

    } else {
      // Fallback to Gemini chat
      const { data } = await aiAPI.chat({ userId: user._id, message: transcript });
      response = data.reply;
    }

    addMsg("assistant", response);
    speak(response);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 max-w-2xl mx-auto">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <MessageCircle size={32} className="text-purple-600" /> Voice Assistant
        </h1>
        <p className="text-gray-500 mt-1">Tap the mic and speak naturally.</p>
      </div>

      {/* Chat history */}
      <div className="px-4 flex flex-col gap-3 mt-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map(({ id, speaker, text }) => (
          <div key={id} className={`flex ${speaker === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-3 text-lg shadow-sm
              ${speaker === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white border text-gray-800 rounded-bl-none"}`}>
              {text}
            </div>
          </div>
        ))}
      </div>

      <VoiceCapture onCommand={handleCommand} />

      <p className="text-center text-gray-400 text-sm mt-2 px-4">
        Try: "What day is today?" · "What happened yesterday?" · "What is my next medicine?"
      </p>
    </div>
  );
}
