// src/components/charts/InventoryStatusChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#4caf50", "#f44336", "#ff9800"];

export default function InventoryStatusChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={[{ name: "No Data", value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
            <Cell fill="#bdbdbd" />
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, "Items"]} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}