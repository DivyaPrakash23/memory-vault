import { useState } from "react";
import { useSelector } from "react-redux";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import { testAPI } from "../api/test.api";
import { speakText } from "../services/speech";

const TESTS = {
  recall_3_objects: {
    label: "Remember 3 Objects",
    description: "Remember these 3 objects, then answer.",
    items: ["Apple", "Chair", "Coin"],
    question: "Which 3 objects did you just see?",
    options: ["Apple", "Chair", "Coin", "Book", "Table", "Pen"],
    correct: ["Apple", "Chair", "Coin"],
  },
  identify_day: {
    label: "What Day Is It?",
    description: "Tell me today's day.",
    question: "What day of the week is it today?",
    options: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    correct: [new Date().toLocaleDateString("en-US", { weekday: "long" })],
  },
};

export default function CognitiveTests() {
  const { user } = useSelector((s) => s.auth);
  const [selected,   setSelected]   = useState(null);
  const [phase,      setPhase]       = useState("intro");    // intro | memorize | answer | result
  const [answers,    setAnswers]     = useState([]);
  const [result,     setResult]      = useState(null);
  const [startTime,  setStartTime]   = useState(null);

  const startTest = (key) => {
    setSelected(key); setPhase("memorize");
    setAnswers([]); setResult(null);
    speakText(TESTS[key].description + " " + (TESTS[key].items || []).join(", "));
    setTimeout(() => {
      setPhase("answer");
      setStartTime(Date.now());
      speakText(TESTS[key].question);
    }, 5000); // 5s memorize time
  };

  const toggleAnswer = (opt) => {
    setAnswers((p) =>
      p.includes(opt) ? p.filter((a) => a !== opt) : [...p, opt]
    );
  };

  const submitAnswers = async () => {
    const test    = TESTS[selected];
    const correct = answers.filter((a) => test.correct.includes(a));
    const score   = correct.length;
    const maxScore = test.correct.length;
    const duration = Math.round((Date.now() - startTime) / 1000);

    await testAPI.submit({
      userId:          user._id,
      testType:        selected,
      score,
      maxScore,
      durationSeconds: duration,
      metadata:        { answers, expected: test.correct },
    });

    setResult({ score, maxScore });
    setPhase("result");
    speakText(score === maxScore
      ? "Excellent! You got everything right."
      : `You got ${score} out of ${maxScore}. Great effort!`);
  };

  const reset = () => { setSelected(null); setPhase("intro"); setAnswers([]); setResult(null); };

  const test = selected ? TESTS[selected] : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Brain size={32} className="text-blue-600" /> Brain Tests
        </h1>
        <p className="text-gray-500 mt-1">Keep your mind sharp with simple daily exercises.</p>
      </div>

      {/* Test selection */}
      {phase === "intro" && (
        <div className="flex flex-col gap-4">
          {Object.entries(TESTS).map(([key, t]) => (
            <button key={key} onClick={() => startTest(key)}
              className="bg-white border-2 border-blue-200 rounded-2xl p-5 text-left hover:border-blue-500 hover:shadow-md active:scale-95 transition">
              <p className="text-xl font-bold text-blue-700">{t.label}</p>
              <p className="text-gray-500 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Memorize phase */}
      {phase === "memorize" && test && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6 text-lg">Remember these items:</p>
          <div className="flex justify-center gap-6">
            {test.items?.map((item) => (
              <div key={item} className="bg-blue-600 text-white rounded-2xl px-8 py-6 text-2xl font-bold shadow-lg">
                {item}
              </div>
            ))}
          </div>
          <p className="text-gray-400 mt-8 text-base animate-pulse">
            Moving to question in a moment…
          </p>
        </div>
      )}

      {/* Answer phase */}
      {phase === "answer" && test && (
        <div>
          <p className="text-2xl font-bold text-gray-800 mb-6">{test.question}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {test.options.map((opt) => (
              <button key={opt} onClick={() => toggleAnswer(opt)}
                className={`rounded-2xl px-4 py-4 text-lg font-semibold border-2 transition active:scale-95
                  ${answers.includes(opt)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"}`}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={submitAnswers} disabled={answers.length === 0}
            className="w-full bg-green-600 text-white rounded-2xl py-4 text-xl font-bold hover:bg-green-700 disabled:opacity-50">
            Submit Answers
          </button>
        </div>
      )}

      {/* Result phase */}
      {phase === "result" && result && (
        <div className="text-center py-10">
          <div className={`inline-flex w-32 h-32 rounded-full items-center justify-center text-4xl font-bold mb-6
            ${result.score === result.maxScore ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {result.score}/{result.maxScore}
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {result.score === result.maxScore ? "🎉 Perfect Score!" : "Good Effort!"}
          </p>
          <p className="text-gray-500 mt-2">
            {result.score === result.maxScore
              ? "Excellent memory today!"
              : `You got ${result.score} out of ${result.maxScore} correct.`}
          </p>
          <button onClick={reset}
            className="mt-8 bg-blue-600 text-white rounded-2xl px-8 py-4 text-lg font-bold hover:bg-blue-700">
            Try Another Test
          </button>
        </div>
      )}
    </div>
  );
}
