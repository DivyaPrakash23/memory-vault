import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Users, Plus, Trash2, Phone, Clock } from "lucide-react";
import api from "../api/axios";

export default function FamilyMembers() {
  const { user }   = useSelector((s) => s.auth);
  const [members,  setMembers]  = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name:"", relation:"", phone:"", memoryNotes:"" });

  const load = async () => {
    const { data } = await api.get(`/family/${user._id}`);
    setMembers(data.members);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post("/family", { ...form, userId: user._id });
    setShowForm(false);
    setForm({ name:"", relation:"", phone:"", memoryNotes:"" });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this family member?")) return;
    await api.delete(`/family/${id}`);
    load();
  };

  const logVisit = async (id, name) => {
    await api.post(`/family/${id}/visit`);
    alert(`${name}'s visit has been recorded.`);
    load();
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Users size={32} className="text-indigo-600" /> Family Members
        </h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white rounded-xl px-4 py-2 flex items-center gap-1 hover:bg-indigo-700">
          <Plus size={18}/> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd}
          className="bg-white rounded-2xl border p-5 mb-6 flex flex-col gap-3 shadow-sm">
          <input className={inp} placeholder="Full Name *" required
            value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <input className={inp} placeholder="Relation (e.g. Son, Daughter) *" required
            value={form.relation} onChange={(e) => setForm({...form, relation: e.target.value})} />
          <input className={inp} placeholder="Phone number" type="tel"
            value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <textarea className={inp} placeholder="Memory notes (e.g. Lives in Mumbai, works in IT)"
            rows={3} value={form.memoryNotes}
            onChange={(e) => setForm({...form, memoryNotes: e.target.value})} />
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-semibold hover:bg-indigo-700">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {members.length === 0 && (
          <p className="text-gray-500 text-center py-10 text-lg">
            No family members added yet. Add your first one! 👨‍👩‍👧
          </p>
        )}
        {members.map((m) => (
          <div key={m._id} className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center
                  text-indigo-700 text-xl font-bold shrink-0">
                  {m.name[0]}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{m.name}</p>
                  <p className="text-indigo-600 font-medium">{m.relation}</p>
                  {m.phone && (
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <Phone size={13}/> {m.phone}
                    </p>
                  )}
                  {m.lastVisitAt && (
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                      <Clock size={12}/> Last visit: {new Date(m.lastVisitAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(m._id)}
                className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={18}/>
              </button>
            </div>

            {m.memoryNotes && (
              <div className="mt-3 bg-indigo-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 italic">{m.memoryNotes}</p>
              </div>
            )}

            <button onClick={() => logVisit(m._id, m.name)}
              className="mt-3 w-full bg-indigo-50 text-indigo-700 rounded-xl py-2 text-sm font-medium
                hover:bg-indigo-100 active:scale-95 transition">
              ✓ Log Visit Today
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
