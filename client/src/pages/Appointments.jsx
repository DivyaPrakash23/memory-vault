import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, Plus, Trash2, MapPin, Clock } from "lucide-react";
import { appointmentAPI } from "../api/appointment.api";

export default function Appointments() {
  const { user }    = useSelector((s) => s.auth);
  const [appointments, setAppointments] = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({
    title: "", description: "", location: "",
    startTime: "", endTime: "",
  });

  const load = async () => {
    const { data } = await appointmentAPI.getAll(user._id);
    setAppointments(data.appointments);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await appointmentAPI.create({ ...form, userId: user._id });
    setShowForm(false);
    setForm({ title:"", description:"", location:"", startTime:"", endTime:"" });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    await appointmentAPI.remove(id);
    load();
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400";

  const upcoming = appointments.filter((a) => new Date(a.startTime) >= new Date());
  const past     = appointments.filter((a) => new Date(a.startTime) <  new Date());

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Calendar size={32} className="text-blue-600" /> Appointments
        </h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-xl px-4 py-2 flex items-center gap-1 hover:bg-blue-700">
          <Plus size={18}/> Add
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd}
          className="bg-white rounded-2xl border p-5 mb-6 flex flex-col gap-3 shadow-sm">
          <input className={inp} placeholder="Appointment title *" required
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})} />

          <input className={inp} placeholder="Description (e.g. Neurology follow-up)"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})} />

          <input className={inp} placeholder="Location (e.g. City Hospital)"
            value={form.location}
            onChange={(e) => setForm({...form, location: e.target.value})} />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Start Date & Time *</label>
            <input className={inp} type="datetime-local" required
              value={form.startTime}
              onChange={(e) => setForm({...form, startTime: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">End Date & Time</label>
            <input className={inp} type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({...form, endTime: e.target.value})} />
          </div>

          <div className="flex gap-3 mt-1">
            <button type="submit"
              className="flex-1 bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700">
              Save Appointment
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Upcoming */}
      <h2 className="text-xl font-bold text-gray-700 mb-3">
        Upcoming ({upcoming.length})
      </h2>
      <div className="flex flex-col gap-3 mb-6">
        {upcoming.length === 0 && (
          <p className="text-gray-500 bg-white rounded-2xl p-4 border">
            No upcoming appointments. Add one above!
          </p>
        )}
        {upcoming.map((a) => (
          <AppointmentCard key={a._id} appointment={a} onDelete={handleDelete} />
        ))}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-400 mb-3">Past ({past.length})</h2>
          <div className="flex flex-col gap-3 opacity-60">
            {past.map((a) => (
              <AppointmentCard key={a._id} appointment={a} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onDelete }) {
  const { _id, title, description, location, startTime, endTime } = appointment;
  const start = new Date(startTime);
  const end   = endTime ? new Date(endTime) : null;

  return (
    <div className="bg-white rounded-2xl border-l-4 border-blue-500 border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xl font-bold text-gray-800">{title}</p>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-blue-500" />
              {start.toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short", year: "numeric"
              })}
            </span>

            <span className="flex items-center gap-1">
              <Clock size={14} className="text-blue-500" />
              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {end && ` — ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </span>

            {location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-blue-500" />
                {location}
              </span>
            )}
          </div>
        </div>

        <button onClick={() => onDelete(_id)}
          className="text-red-400 hover:text-red-600 p-1 ml-2">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}