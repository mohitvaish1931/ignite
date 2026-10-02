"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const registrationsData = [
  { name: "Apr 10", value: 120 },
  { name: "Apr 17", value: 250 },
  { name: "Apr 24", value: 180 },
  { name: "May 1", value: 350 },
  { name: "May 8", value: 280 },
  { name: "May 17", value: 450 },
];

const sourceData = [
  { name: "Website", value: 45 },
  { name: "Social Media", value: 30 },
  { name: "Email", value: 15 },
  { name: "Other", value: 10 },
];

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#64748b"];

const demographicsData = [
  { name: "18-24", value: 65 },
  { name: "25-34", value: 25 },
  { name: "35-44", value: 7 },
  { name: "45+", value: 3 },
];

export function RegistrationsChart({ data = [] }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : registrationsData; // Use fallback if not provided

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="regColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
            itemStyle={{ color: "#fdba74" }}
          />
          <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#regColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceChart() {
  return (
    <div className="w-full h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sourceData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {sourceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
            itemStyle={{ color: "#f8fafc" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-2xl font-bold text-slate-100">100%</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total</p>
      </div>
    </div>
  );
}

export function DemographicsChart() {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={demographicsData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={50} />
          <Tooltip 
            cursor={{ fill: "#1e293b" }}
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
          />
          <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
