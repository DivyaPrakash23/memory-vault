import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export default function ComplianceChart({ data }) {
  // data: [{ date: "Mon", taken: 3, missed: 1 }, ...]
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4">
      <h3 className="font-bold text-lg text-gray-700 mb-4">Medication Compliance (7 days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="taken"  fill="#10B981" radius={[4,4,0,0]} name="Taken"  />
          <Bar dataKey="missed" fill="#EF4444" radius={[4,4,0,0]} name="Missed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}