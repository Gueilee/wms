"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Localizacao } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";

export function OcupacaoPorRuaChart({ localizacoes }: { localizacoes: Localizacao[] }) {
  const dados = RUAS_ORDEM.map((rua) => {
    const doRua = localizacoes.filter((l) => l.rua === rua);
    return {
      rua,
      ocupado: doRua.filter((l) => l.status === "ocupado").length,
      livre: doRua.filter((l) => l.status === "livre").length,
      bloqueado: doRua.filter((l) => l.status === "bloqueado").length,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="rua" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-faint)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="ocupado" stackId="a" fill="#b8905b" name="Ocupado" radius={[0, 0, 0, 0]} />
        <Bar dataKey="bloqueado" stackId="a" fill="#d97706" name="Bloqueado" />
        <Bar dataKey="livre" stackId="a" fill="var(--color-surface-muted)" name="Livre" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
