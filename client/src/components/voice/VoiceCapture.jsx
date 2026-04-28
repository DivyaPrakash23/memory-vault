import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech";

export default function VoiceCapture({ onCommand }) {
  const { listen, speak, isListening, transcript, error } = useSpeech();
  const [processing, setProcessing] = useState(false);

  const handleListen = async () => {
    listen();
  };

  const handleSubmit = async () => {
    if (!transcript) return;
    setProcessing(true);
    await onCommand?.(transcript, speak);
    setProcessing(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Mic button */}
      <button
        onClick={handleListen}
        disabled={isListening || processing}
        className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95
          ${isListening ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {isListening ? <MicOff size={44} /> : <Mic size={44} />}
      </button>

      <p className="text-gray-500 text-lg">
        {isListening ? "Listening... speak now" : "Tap to speak"}
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {transcript && (
        <div className="w-full max-w-lg bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-gray-500 text-sm mb-1">You said:</p>
          <p className="text-xl font-medium text-gray-800">{transcript}</p>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="mt-4 bg-blue-600 text-white rounded-xl px-6 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? "Processing..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
