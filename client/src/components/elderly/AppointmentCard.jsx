import { Calendar, MapPin, Clock } from "lucide-react";

export default function AppointmentCard({ appointment }) {
  const { title, description, location, startTime } = appointment;
  const time = new Date(startTime);

  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
      <p className="text-xl font-bold text-blue-800">{title}</p>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        {location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {time.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}