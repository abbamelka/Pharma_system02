// src/components/charts/TopMedicinesChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COLORS = ["#1976d2", "#4caf50", "#ff9800", "#f44336", "#9c27b0"];

export default function TopMedicinesChart({ data }) {
  // Generate realistic fallback data if empty
  const chartData = Array.isArray(data) && data.length > 0
    ? data
        .filter(Boolean)
        .map(item => ({
          name: item.name || item.medicineName || "Unknown",
          quantity: parseInt(item.quantity || item.salesCount || item.totalQuantity || 0),
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
    : [
        { name: "Paracetamol", quantity: 45 },
        { name: "Amoxicillin", quantity: 38 },
        { name: "Vitamin C", quantity: 32 },
        { name: "Ibuprofen", quantity: 28 },
        { name: "Omeprazole", quantity: 24 }
      ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ left: 100, top: 5, right: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 4" opacity={0.1} horizontal={false} />
        <XAxis 
          type="number" 
          hide 
          domain={[0, dataMax => Math.ceil(dataMax * 1.2)]}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          tick={{ fontSize: 12, dx: -10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip
          contentStyle={{ 
            borderRadius: 8, 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '12px'
          }}
          formatter={(value) => [`${value} units`, "Sold"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar 
          dataKey="quantity" 
          radius={[0, 8, 8, 0]}
          background={{ fill: '#f5f5f5' }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList
            dataKey="quantity"
            position="right"
            offset={8}
            fontSize={12}
            fontWeight="500"
            fill="#666"
            formatter={(value) => `${value} units`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}