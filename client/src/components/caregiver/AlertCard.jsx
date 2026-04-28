import { AlertTriangle, CheckCheck } from "lucide-react";
import { alertAPI } from "../../api/alert.api";

const SEVERITY = {
  high:   "bg-red-50 border-red-300 text-red-800",
  medium: "bg-yellow-50 border-yellow-300 text-yellow-800",
  low:    "bg-blue-50 border-blue-300 text-blue-700",
};

export default function AlertCard({ alert, onResolve }) {
  const resolve = async () => {
    await alertAPI.resolve(alert._id);
    onResolve?.(alert._id);
  };

  return (
    <div className={`rounded-2xl border-2 p-4 ${SEVERITY[alert.severity]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2 items-start">
          <AlertTriangle size={20} className="mt-1 shrink-0" />
          <div>
            <p className="font-bold capitalize">{alert.type.replace(/_/g, " ")}</p>
            <p className="text-sm mt-1">{alert.message}</p>
            <p className="text-xs mt-2 opacity-70">
              {new Date(alert.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <button onClick={resolve}
          className="shrink-0 bg-white border rounded-xl px-3 py-1 text-sm flex items-center gap-1 hover:bg-gray-50">
          <CheckCheck size={14} /> Resolve
        </button>
      </div>
    </div>
  );
}