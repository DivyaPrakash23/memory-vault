import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { medicationAPI } from "../../api/medication.api";
import { speakText } from "../../services/speech";

const STATUS_STYLES = {
  taken:   "bg-green-100 text-green-700 border-green-200",
  missed:  "bg-red-100  text-red-700   border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function MedicineCard({ log, onConfirm }) {
  const { medicationId: med, status, scheduledTime, _id } = log;

  const handleConfirm = async () => {
    await medicationAPI.confirm(_id, "button");
    speakText(`Great! ${med?.name} marked as taken.`);
    onConfirm?.();
  };

  return (
    <div className={`rounded-2xl border-2 p-4 ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">{med?.name || "Medicine"}</p>
          <p className="text-sm mt-1">{med?.dose} — {med?.instructions}</p>
          <p className="text-sm mt-1 flex items-center gap-1">
            <Clock size={14} />
            {new Date(scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {status === "taken"  && <CheckCircle size={32} className="text-green-600" />}
          {status === "missed" && <AlertCircle size={32} className="text-red-600" />}
          {status === "pending" && (
            <button onClick={handleConfirm}
              className="bg-green-600 text-white rounded-xl px-4 py-2 text-lg font-semibold hover:bg-green-700 active:scale-95 transition">
              ✓ Taken
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
