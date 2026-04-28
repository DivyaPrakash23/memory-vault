import { Brain, HomeIcon, Pill, Calendar, BookOpen, Mic, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { authAPI } from "../../api/auth.api";

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await authAPI.logout();
    dispatch(logout());
    navigate("/login");
  };

  const links = user?.role === "caregiver"
    ? [{ to: "/dashboard", icon: <LayoutDashboard size={20}/>, label: "Dashboard" }]
    : [
        { to: "/",          icon: <HomeIcon size={20}/>,     label: "Home"      },
        { to: "/medicines", icon: <Pill size={20}/>,     label: "Medicines" },
        { to: "/assistant", icon: <Brain size={20}/>,    label: "Memory"    },
        { to: "/voice",     icon: <Mic size={20}/>,      label: "Voice"     },
        { to: "/journal",   icon: <BookOpen size={20}/>, label: "Journal"   },
        { to: "/appointments", icon: <Calendar size={20}/>, label: "Appointments" },
        { to: "/family",    icon: <Users size={20}/>,    label: "Family" },
      ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Brain size={28} /> MemoryVault AI
        </Link>

        <div className="flex items-center gap-4">
          {links.map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
              {icon} <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          <button onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium">
            <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

