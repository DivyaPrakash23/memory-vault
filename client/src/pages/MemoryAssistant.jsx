import { useState } from "react";
import { useSelector } from "react-redux";
import { Brain, Send } from "lucide-react";
import { aiAPI } from "../api/ai.api";
import { speakText } from "../services/speech";
import MemorySummary from "../components/elderly/MemorySummary";

export default function MemoryAssistant() {
  const { user } = useSelector((s) => s.auth);
  const [question, setQuestion] = useState("");
  const [summary,  setSummary]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const quickQuestions = [
    "What happened yesterday?",
    "Who visited me recently?",
    "What medicines did I take today?",
    "What is my plan today?",
    "What did I eat yesterday?",
  ];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true);
    setChatHistory((p) => [...p, { role: "user", text: query }]);

    const now   = new Date();
    const start = new Date(now); start.setDate(now.getDate() - 2); start.setHours(0,0,0,0);
    const end   = new Date();

    const { data } = await aiAPI.askMemory({
      userId: user._id,
      question: query,
      dateRange: { start, end },
    });

    setSummary(data.summary);
    speakText(data.summary);
    setChatHistory((p) => [...p, { role: "assistant", text: data.summary }]);
    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Brain size={32} className="text-purple-600" /> Memory Assistant
        </h1>
        <p className="text-gray-500 mt-1">Ask me anything about your recent days.</p>
      </div>

      {/* Quick question chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quickQuestions.map((q) => (
          <button key={q} onClick={() => ask(q)}
            className="bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-medium hover:bg-purple-200 active:scale-95 transition">
            {q}
          </button>
        ))}
      </div>

      {/* Chat history */}
      <div className="flex flex-col gap-3 mb-6 max-h-80 overflow-y-auto">
        {chatHistory.map(({ role, text }, i) => (
          <div key={i} className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-sm rounded-2xl px-4 py-3 text-base shadow-sm
              ${role === "user"
                ? "bg-purple-600 text-white rounded-br-none"
                : "bg-white border text-gray-800 rounded-bl-none"}`}>
              {text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl px-4 py-3 text-gray-500 text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Text input */}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask anything about your memory..."
          className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button onClick={() => ask()} disabled={loading || !question.trim()}
          className="bg-purple-600 text-white rounded-2xl px-5 py-3 hover:bg-purple-700 disabled:opacity-50">
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}
