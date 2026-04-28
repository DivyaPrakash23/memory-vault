import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Brain, Pill, Mic, BookOpen, Phone, Calendar } from "lucide-react";
import { aiAPI } from "../api/ai.api";
import { appointmentAPI } from "../api/appointment.api";
import { speakText } from "../services/speech";
import { useSocket } from "../hooks/useSocket";
import AppointmentCard from "../components/elderly/AppointmentCard";
import MemorySummary   from "../components/elderly/MemorySummary";
import LoadingSpinner  from "../components/common/LoadingSpinner";

export default function Home() {
  const { user } = useSelector((s) => s.auth);
  const [summary,       setSummary]       = useState("");
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [notification,  setNotification]  = useState(null);

  useSocket(user?._id, {
    notification: (data) => {
      setNotification(data);
      speakText(data.body || data.message || "You have a new notification");
      setTimeout(() => setNotification(null), 10000);
    },
  });

  useEffect(() => {
  if (!user?._id) return;

  let called = false;

  const fetchAppointments = async () => {
    if (called) return; // prevent multiple calls
    called = true;

    const { data } = await appointmentAPI.getToday(user._id);
    setAppointments(data.appointments);
  };

  fetchAppointments();
}, [user?._id]);

  const askYesterday = async () => {
    setLoading(true);
    const now   = new Date();
    const start = new Date(now); start.setDate(now.getDate()-1); start.setHours(0,0,0,0);
    const end   = new Date(start); end.setHours(23,59,59,999);
    const { data } = await aiAPI.askMemory({
      userId: user._id,
      question: "What happened yesterday? Summarize in simple, friendly language.",
      dateRange: { start, end },
    });
    setSummary(data.summary);
    speakText(data.summary);
    setLoading(false);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const quickLinks = [
    { to: "/medicines", icon: <Pill size={28}/>,    label: "Medicines",  color: "bg-green-100 text-green-700"  },
    { to: "/voice",     icon: <Mic size={28}/>,      label: "Talk to AI", color: "bg-purple-100 text-purple-700"},
    { to: "/journal",   icon: <BookOpen size={28}/>, label: "Journal",    color: "bg-yellow-100 text-yellow-700"},
    { to: "/tests",     icon: <Brain size={28}/>,    label: "Brain Test", color: "bg-blue-100 text-blue-700"   },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-lg mt-1">{today}</p>
      </div>

      {/* Live notification banner */}
      {notification && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 animate-bounce-once shadow-lg">
          <p className="font-bold text-lg">{notification.title || "Reminder"}</p>
          <p className="mt-1">{notification.body || notification.message}</p>
        </div>
      )}

      {/* Yesterday button */}
      <button onClick={askYesterday} disabled={loading}
        className="w-full bg-blue-600 text-white text-2xl font-bold rounded-3xl py-6 hover:bg-blue-700 disabled:opacity-60 shadow-md active:scale-95 transition-all mb-6">
        {loading ? "Thinking..." : "📅 What happened yesterday?"}
      </button>

      {/* AI Summary */}
      {summary && <div className="mb-6"><MemorySummary summary={summary} title="Yesterday" /></div>}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {quickLinks.map(({ to, icon, label, color }) => (
          <Link key={to} to={to}
            className={`${color} rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95`}>
            {icon}
            <span className="font-semibold text-lg">{label}</span>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Calendar size={20}/> Today's Schedule
      </h2>
      {appointments.length === 0
        ? <p className="text-gray-500 bg-white rounded-2xl p-4 border">No appointments today 🌟</p>
        : <div className="flex flex-col gap-3">
            {appointments.map((a) => <AppointmentCard key={a._id} appointment={a} />)}
          </div>
      }
    </div>
  );
}
