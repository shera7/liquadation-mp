"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#E8A33D", "#3E7A4C", "#1C1F22", "#C0392B", "#6B6F76", "#C8842A"];

export default function CategoryBarChart({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) {
    return <div className="h-[220px] flex items-center justify-center text-sm text-steel">Пока нет данных</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DDDAD1" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#6B6F76" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#3D3D3A" }} axisLine={false} tickLine={false} width={110} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #DDDAD1" }} formatter={(value: number) => [value, "Товаров"]} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
