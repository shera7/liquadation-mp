"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export default function RequestsStatusDonut({ data }: { data: StatusSlice[] }) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return <div className="h-[220px] flex items-center justify-center text-sm text-steel">Пока нет данных</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {filtered.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #DDDAD1" }} />
        <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#3D3D3A" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
