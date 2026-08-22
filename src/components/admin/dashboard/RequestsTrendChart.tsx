"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RequestsTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E8A33D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DDDAD1" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B6F76" }} axisLine={{ stroke: "#DDDAD1" }} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: "#6B6F76" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #DDDAD1" }}
          labelStyle={{ color: "#1C1F22", fontWeight: 600 }}
          formatter={(value: number) => [value, "Заявок"]}
        />
        <Area type="monotone" dataKey="count" stroke="#C8842A" strokeWidth={2} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
