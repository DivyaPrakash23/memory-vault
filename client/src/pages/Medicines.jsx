import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Pill, Plus } from "lucide-react";
import { medicationAPI } from "../api/medication.api";
import MedicineCard    from "../components/elderly/MedicineCard";
import LoadingSpinner  from "../components/common/LoadingSpinner";

export default function Medicines() {
  const { user }  = useSelector((s) => s.auth);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name:"", dose:"", times:"08:00", instructions:"" });

  const loadLogs = async () => {
  const { data } = await medicationAPI.getAll(user._id); // ✅ CHANGE HERE
  setLogs(data.medications); // ✅ CHANGE HERE
  setLoading(false);
};

  useEffect(() => { if (user) loadLogs(); }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await medicationAPI.create({
      userId: user._id,
      name: form.name, dose: form.dose,
      times: [form.times], instructions: form.instructions,
    });
    setShowAdd(false); setForm({ name:"", dose:"", times:"08:00", instructions:"" });
    loadLogs();
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Pill size={32} className="text-green-600" /> Medicines
        </h1>
        <button onClick={() => setShowAdd(!showAdd)}
          className="bg-green-600 text-white rounded-xl px-4 py-2 flex items-center gap-1 hover:bg-green-700">
          <Plus size={18}/> Add
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd}
          className="bg-white rounded-2xl border p-5 mb-6 flex flex-col gap-3 shadow-sm">
          <input className={inp} placeholder="Medicine name *" required
            value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <input className={inp} placeholder="Dose (e.g. 5mg) *" required
            value={form.dose} onChange={(e) => setForm({...form, dose: e.target.value})} />
          <input className={inp} type="time" required
            value={form.times} onChange={(e) => setForm({...form, times: e.target.value})} />
          <input className={inp} placeholder="Instructions (e.g. after breakfast)"
            value={form.instructions} onChange={(e) => setForm({...form, instructions: e.target.value})} />
          <div className="flex gap-3 mt-1">
            <button type="submit" className="flex-1 bg-green-600 text-white rounded-xl py-2 font-semibold hover:bg-green-700">
              Save
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner text="Loading medicines..." /> : (
        <div className="flex flex-col gap-4">
          {logs.length === 0
            ? <p className="text-gray-500 text-center text-lg py-10">No medicines scheduled today.</p>
            : logs.map((log) => (
                <MedicineCard key={log._id} log={log} onConfirm={loadLogs} />
              ))
          }
        </div>
      )}
    </div>
  );
}
