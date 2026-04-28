import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BookOpen, Upload, Trash2 } from "lucide-react";
import { journalAPI } from "../api/journal.api";
import { speakText }  from "../services/speech";

export default function Journal() {
  const { user }  = useSelector((s) => s.auth);
  const [journals, setJournals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title: "", tags: "", memoryDate: "" });
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [preview,  setPreview]  = useState(null);

  const load = async () => {
    const { data } = await journalAPI.getAll(user._id);
    setJournals(data.journals);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("userId", user._id);
    fd.append("title", form.title);
    fd.append("tags",  JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    if (form.memoryDate) fd.append("memoryDate", form.memoryDate);
    if (file) fd.append("photo", file);
    await journalAPI.upload(fd);
    setShowForm(false); setForm({ title:"", tags:"", memoryDate:"" });
    setFile(null); setPreview(null);
    setLoading(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this memory?")) return;
    await journalAPI.remove(id);
    load();
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <BookOpen size={32} className="text-yellow-600" /> Memory Journal
        </h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 text-white rounded-xl px-4 py-2 flex items-center gap-1 hover:bg-yellow-600">
          <Upload size={16}/> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl border p-5 mb-6 flex flex-col gap-3 shadow-sm">
          <input className={inp} placeholder="Memory title *" required
            value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          <input className={inp} placeholder="Tags (comma separated: family, festival)"
            value={form.tags}  onChange={(e) => setForm({...form, tags: e.target.value})} />
          <input className={inp} type="date"
            value={form.memoryDate} onChange={(e) => setForm({...form, memoryDate: e.target.value})} />
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-yellow-400 transition">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload"/>
            <label htmlFor="photo-upload" className="cursor-pointer">
              {preview
                ? <img src={preview} alt="preview" className="mx-auto h-40 object-cover rounded-xl" />
                : <p className="text-gray-500">Click to upload a photo</p>}
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-yellow-500 text-white rounded-xl py-2 font-semibold hover:bg-yellow-600 disabled:opacity-50">
              {loading ? "Saving..." : "Save Memory"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-5">
        {journals.length === 0 && (
          <p className="text-gray-500 text-center py-12 text-lg">
            No memories yet. Add your first one! 🌸
          </p>
        )}
        {journals.map((j) => (
          <div key={j._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {j.photoUrl && (
              <img src={j.photoUrl} alt={j.title} className="w-full h-52 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{j.title}</h2>
                  {j.memoryDate && (
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(j.memoryDate).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(j._id)}
                  className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={18} />
                </button>
              </div>

              {j.caption && (
                <div className="mt-3 bg-yellow-50 rounded-xl p-3">
                  <p className="text-gray-700 italic">{j.caption}</p>
                  <button onClick={() => speakText(j.caption)}
                    className="text-yellow-600 text-xs mt-1 underline">🔊 Read aloud</button>
                </div>
              )}

              {j.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {j.tags.map((t) => (
                    <span key={t} className="bg-gray-100 text-gray-600 text-xs rounded-full px-3 py-1">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
