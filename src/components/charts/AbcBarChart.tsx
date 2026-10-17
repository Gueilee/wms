"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatarMoeda } from "@/lib/format";

const CORES = { A: "#16a34a", B: "#2563eb", C: "#94a3b8" };

export function AbcBarChart({ dados }: { dados: { classe: "A" | "B" | "C"; valor: number; percentual: number; itens: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border)" />
        <XAxis type="number" tickFormatter={(v) => formatarMoeda(v).replace("R$", "")} tick={{ fontSize: 11, fill: "var(--color-text-faint)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="classe"
          width={28}
          tick={{ fontSize: 13, fontWeight: 700, fill: "var(--color-text)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value, _name, item) => [
            `${formatarMoeda(Number(value))} · ${item.payload.itens} SKUs`,
            `Classe ${item.payload.classe}`,
          ]}
          contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
          {dados.map((d) => (
            <Cell key={d.classe} fill={CORES[d.classe]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
