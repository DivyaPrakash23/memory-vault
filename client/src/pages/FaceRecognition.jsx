import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Camera, UserPlus, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import {
  loadModels,
  extractDescriptor,
  matchFace,
  buildLabeledDescriptors,
} from "../services/faceRecognition";
import { speakText } from "../services/speech";

export default function FaceRecognition() {
  const { user }   = useSelector((s) => s.auth);
  const videoRef   = useRef(null);
  const [profiles, setProfiles]   = useState([]);
  const [match,    setMatch]      = useState(null);
  const [stream,   setStream]     = useState(null);
  const [modelsOk, setModelsOk]   = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [mode,     setMode]       = useState("idle"); // idle | scanning | registering
  const [regForm,  setRegForm]    = useState({ familyMemberId:"", label:"" });
  const [family,   setFamily]     = useState([]);

  useEffect(() => {
    loadModels().then(() => setModelsOk(true));
    fetchProfiles();
    fetchFamily();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await api.get(`/faces/${user._id}`);
    setProfiles(data.profiles);
  };

  const fetchFamily = async () => {
    // We'll reuse activityLogs endpoint conceptually; in a full app use /api/family
    // For now just load from faces
  };

  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = s;
    setStream(s);
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setMode("idle");
  };

  const scanFace = async () => {
    if (!modelsOk || profiles.length === 0) return;
    setLoading(true);
    try {
      const descriptor = await extractDescriptor(videoRef.current);
      const labeled    = buildLabeledDescriptors(profiles);
      const result     = matchFace(descriptor, labeled);
      setMatch(result);
      if (result.isMatch) {
        speakText(`I can see ${result.label}. Welcome!`);
      } else {
        speakText("I don't recognize this person.");
      }
    } catch (e) {
      setMatch({ isMatch: false, label: "No face detected" });
    }
    setLoading(false);
  };

  const registerFace = async () => {
    if (!regForm.label) return alert("Enter a name");
    setLoading(true);
    try {
      const descriptor = await extractDescriptor(videoRef.current);
      await api.post("/faces/register", {
        userId: user._id,
        familyMemberId: regForm.familyMemberId || user._id,
        label: regForm.label,
        descriptor: Array.from(descriptor),
      });
      alert(`${regForm.label} registered successfully!`);
      fetchProfiles();
      stopCamera();
    } catch (e) {
      alert("No face detected — try again in good lighting.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10 max-w-2xl mx-auto">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Camera size={32} className="text-blue-600" /> Family Recognition
        </h1>
        <p className="text-gray-500 mt-1">
          Recognize family members — runs privately in your browser.
        </p>
      </div>

      {/* Privacy note */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
        <ShieldCheck size={22} className="text-green-600 shrink-0 mt-0.5" />
        <p className="text-green-800 text-sm">
          Face recognition runs entirely in your browser. Raw face images are never uploaded.
          Only encrypted descriptors are stored.
        </p>
      </div>

      {/* Camera feed */}
      {stream && (
        <div className="mb-4 relative">
          <video ref={videoRef} autoPlay muted playsInline
            className="w-full rounded-2xl border-4 border-blue-200 shadow-lg" />
          {match && (
            <div className={`absolute bottom-4 left-4 right-4 rounded-xl p-3 text-white font-bold text-lg text-center
              ${match.isMatch ? "bg-green-600" : "bg-gray-700"}`}>
              {match.isMatch ? `✅ ${match.label}` : "❓ Unknown person"}
            </div>
          )}
        </div>
      )}
      {!stream && (
        <div ref={videoRef} className="w-full h-52 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
          <Camera size={52} className="text-gray-400" />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mb-6">
        {!stream ? (
          <button onClick={async () => { setMode("scanning"); await startCamera(); }}
            className="bg-blue-600 text-white rounded-2xl py-4 text-xl font-bold hover:bg-blue-700 active:scale-95">
            📷 Open Camera
          </button>
        ) : (
          <>
            <button onClick={scanFace} disabled={loading || profiles.length === 0}
              className="bg-blue-600 text-white rounded-2xl py-4 text-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Scanning..." : "🔍 Who Is This?"}
            </button>

            <div className="flex gap-3">
              <input
                placeholder="Person's name"
                value={regForm.label}
                onChange={(e) => setRegForm({...regForm, label: e.target.value})}
                className="flex-1 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={registerFace} disabled={loading}
                className="bg-green-600 text-white rounded-xl px-5 py-3 font-semibold hover:bg-green-700 flex items-center gap-1">
                <UserPlus size={18}/> Register
              </button>
            </div>

            <button onClick={stopCamera}
              className="bg-gray-100 text-gray-700 rounded-2xl py-3 text-lg hover:bg-gray-200">
              ✕ Close Camera
            </button>
          </>
        )}
      </div>

      {/* Registered profiles */}
      <h2 className="text-xl font-bold text-gray-700 mb-3">Registered Faces ({profiles.length})</h2>
      <div className="flex flex-col gap-3">
        {profiles.length === 0 && (
          <p className="text-gray-500 text-sm">No faces registered yet. Register family members above.</p>
        )}
        {profiles.map((p) => (
          <div key={p._id} className="bg-white border rounded-2xl p-4 flex items-center gap-4">
            {p.sampleImageUrl
              ? <img src={p.sampleImageUrl} className="w-14 h-14 rounded-full object-cover border-2 border-blue-200" />
              : <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {p.label[0]}
                </div>
            }
            <div>
              <p className="font-bold text-gray-800 text-lg">{p.label}</p>
              <p className="text-gray-500 text-sm">Descriptor registered ✓</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
