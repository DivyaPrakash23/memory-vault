import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/authSlice";
import { Brain, HomeIcon, Pill, Calendar, BookOpen, Mic, LayoutDashboard, LogOut, Users } from "lucide-react";
import Navbar           from "./components/common/Navbar";
import ProtectedRoute   from "./components/common/ProtectedRoute";
import Login            from "./pages/Login";
import FamilyMembers    from "./pages/FamilyMembers";
import Home             from "./pages/Home";
import Medicines        from "./pages/Medicines";
import MemoryAssistant  from "./pages/MemoryAssistant";
import VoiceMode        from "./pages/VoiceMode";
import Appointments     from "./pages/Appointments";
import Journal          from "./pages/Journal";
import CognitiveTests   from "./pages/CognitiveTests";
import FaceRecognition  from "./pages/FaceRecognition";
import CaregiverDashboard from "./pages/CaregiverDashboard";

export default function App() {
  const dispatch      = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      {user && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

        {/* Elderly */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><MemoryAssistant /></ProtectedRoute>} />
        <Route path="/voice"     element={<ProtectedRoute><VoiceMode /></ProtectedRoute>} />
        <Route path="/journal"   element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/tests"     element={<ProtectedRoute><CognitiveTests /></ProtectedRoute>} />
        <Route path="/faces"     element={<ProtectedRoute><FaceRecognition /></ProtectedRoute>} />
        <Route path="/family"    element={<ProtectedRoute><FamilyMembers /></ProtectedRoute>} />
        {/* Caregiver */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="caregiver"><CaregiverDashboard /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}