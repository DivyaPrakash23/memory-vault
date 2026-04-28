import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../store/authSlice";
import { Brain } from "lucide-react";

export default function Login() {
  const [mode, setMode]   = useState("login"); // login | register
  const [form, setForm]   = useState({ fullName:"", email:"", phone:"", password:"", role:"elderly", age:"" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = mode === "login" ? login : register;
    const result = await dispatch(action(form));
    if (!result.error) navigate(form.role === "caregiver" ? "/dashboard" : "/");
  };

  const inp = "w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Brain size={52} className="text-blue-600 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">MemoryVault AI</h1>
          <p className="text-gray-500 mt-1">Your memory support companion</p>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {["login","register"].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all capitalize
                ${mode === m ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}>
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <>
              <input className={inp} placeholder="Full Name" required
                value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
              <input className={inp} type="number" placeholder="Age"
                value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} />
              <select className={inp} value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}>
                <option value="elderly">Elderly User</option>
                <option value="caregiver">Caregiver</option>
              </select>
            </>
          )}

          <input className={inp} type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          <input className={inp} type="password" placeholder="Password" required minLength={6}
            value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white rounded-xl py-4 text-xl font-bold hover:bg-blue-700 disabled:opacity-50 mt-2">
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
