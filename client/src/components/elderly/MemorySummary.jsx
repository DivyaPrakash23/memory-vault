import { Brain } from "lucide-react";
import { speakText } from "../../services/speech";

export default function MemorySummary({ summary, title = "Memory Summary" }) {
  if (!summary) return null;
  return (
    <div className="rounded-2xl bg-purple-50 border border-purple-200 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-purple-800 flex items-center gap-2">
          <Brain size={22} /> {title}
        </h2>
        <button
          onClick={() => speakText(summary)}
          className="text-purple-600 hover:text-purple-800 text-sm underline"
        >
          🔊 Read Aloud
        </button>
      </div>
      <p className="mt-3 text-lg text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );
}