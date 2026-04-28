import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LayoutDashboard, AlertTriangle, Pill, Brain, Activity } from "lucide-react";
import { alertAPI }      from "../api/alert.api";
import { medicationAPI } from "../api/medication.api";
import { aiAPI }         from "../api/ai.api";
import { testAPI }       from "../api/test.api";
import AlertCard         from "../components/caregiver/AlertCard";
import ComplianceChart   from "../components/caregiver/ComplianceChart";
import MoodTrend         from "../components/caregiver/MoodTrend";
import LoadingSpinner    from "../components/common/LoadingSpinner";
import { useSocket }     from "../hooks/useSocket";

// Build last-7-days chart stub from logs
const buildChartData = (logs) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      date:   d.toLocaleDateString("en-IN", { weekday: "short" }),
      taken:  0,
      missed: 0,
    };
  });
  logs.forEach((log) => {
    const idx = days.findIndex((d) => {
      const ld = new Date(log.scheduledTime);
      return d.date === ld.toLocaleDateString("en-IN", { weekday: "short" });
    });
    if (idx >= 0) {
      if (log.status === "taken")  days[idx].taken++;
      if (log.status === "missed") days[idx].missed++;
    }
  });
  return days;
};

export default function CaregiverDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [alerts,      setAlerts]      = useState([]);
  const [medLogs,     setMedLogs]     = useState([]);
  const [testTrends,  setTestTrends]  = useState([]);
  const [aiSummary,   setAiSummary]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [elderlyId,   setElderlyId]   = useState(null);

  // In a full implementation, caregiver would select from their assigned users.
  // Here we use a simple localStorage stored elderlyId for the demo.
  const storedElderlyId = elderlyId || localStorage.getItem("monitoringUserId");

  useSocket(user?._id, {
    notification: (data) => {
      if (data.type === "caregiver_alert") {
        setAlerts((p) => [{ _id: Date.now(), ...data, createdAt: new Date() }, ...p]);
      }
    },
  });

  const load = async (uid) => {
    if (!uid) return;
    setLoading(true);
    const [alertRes, medRes, testRes] = await Promise.all([
      alertAPI.getAll(uid),
      medicationAPI.getLogs(uid),
      testAPI.getTrends(uid),
    ]);
    setAlerts(alertRes.data.alerts);
    setMedLogs(medRes.data.logs);
    setTestTrends(testRes.data.trend);
    setLoading(false);

    // Generate AI summary
    try {
      const { data } = await aiAPI.caregiverReport(uid);
      setAiSummary(data.summary);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    if (storedElderlyId) load(storedElderlyId);
    else setLoading(false);
  }, []);

  const handleSetUser = (e) => {
    e.preventDefault();
    localStorage.setItem("monitoringUserId", elderlyId);
    load(elderlyId);
  };

  const chartData = buildChartData(medLogs);

  const moodData = [
    { date: "Mon", mood: 4 }, { date: "Tue", mood: 3 }, { date: "Wed", mood: 4 },
    { date: "Thu", mood: 5 }, { date: "Fri", mood: 3 }, { date: "Sat", mood: 4 },
    { date: "Sun", mood: 4 },
  ]; // In production, fetch from activity logs with type="mood"

  const takenToday  = medLogs.filter((l) => l.status === "taken").length;
  const missedToday = medLogs.filter((l) => l.status === "missed").length;
  const unresolved  = alerts.length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-3xl mx-auto">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <LayoutDashboard size={32} className="text-blue-600" /> Caregiver Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Monitor your patient's daily health and activity.</p>
      </div>

      {/* Select user to monitor */}
      {!storedElderlyId && (
        <form onSubmit={handleSetUser} className="bg-white border rounded-2xl p-5 mb-6 flex gap-3">
          <input
            placeholder="Enter Patient User ID to monitor"
            value={elderlyId || ""}
            onChange={(e) => setElderlyId(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit"
            className="bg-blue-600 text-white rounded-xl px-5 py-3 font-semibold hover:bg-blue-700">
            Monitor
          </button>
        </form>
      )}

      {loading && <LoadingSpinner text="Loading dashboard..." />}

      {!loading && storedElderlyId && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Alerts",  value: unresolved,  color: "bg-red-50   text-red-700",   icon: <AlertTriangle size={22}/> },
              { label: "Taken",   value: takenToday,  color: "bg-green-50 text-green-700", icon: <Pill size={22}/>          },
              { label: "Missed",  value: missedToday, color: "bg-yellow-50 text-yellow-700", icon: <Pill size={22}/>         },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className={`rounded-2xl p-4 ${color} flex flex-col items-center gap-1 shadow-sm`}>
                {icon}
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
              <p className="font-bold text-purple-800 flex items-center gap-2 mb-2">
                <Brain size={18}/> AI Daily Summary
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{aiSummary}</p>
            </div>
          )}

          {/* Compliance chart */}
          <div className="mb-6">
            <ComplianceChart data={chartData} />
          </div>

          {/* Mood trend */}
          <div className="mb-6">
            <MoodTrend data={moodData} />
          </div>

          {/* Cognitive test trends */}
          {testTrends.length > 0 && (
            <div className="bg-white border rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={18}/> Recent Cognitive Test Scores
              </h3>
              <div className="flex flex-col gap-2">
                {testTrends.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 capitalize">{t.testType?.replace(/_/g," ")}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${t.scorePercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{t.scorePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Active Alerts ({alerts.length})
          </h2>
          <div className="flex flex-col gap-3">
            {alerts.length === 0
              ? <p className="text-gray-500 bg-white rounded-2xl p-4 border">No active alerts. All clear! ✅</p>
              : alerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert}
                    onResolve={(id) => setAlerts((p) => p.filter((a) => a._id !== id))} />
                ))
            }
          </div>
        </>
      )}
    </div>
  );
}

