import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MoodTrend({ data }) {
  // data: [{ date: "Mon", mood: 4 }, ...]
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4">
      <h3 className="font-bold text-lg text-gray-700 mb-4">Mood Trend (7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}