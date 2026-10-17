"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { Box, LayoutGrid, Move3d, Radio } from "lucide-react";
import type { Localizacao, MovimentoEstoque } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { mapaUltimaAtividade, intensidadeAtividade, type ModoHeatmap } from "@/lib/heatmap";
import { useAgora } from "@/hooks/useAgora";
import type { PresetCamera } from "./CameraRig";

interface HudProps {
  modo: ModoHeatmap;
  onModo: (m: ModoHeatmap) => void;
  opacidade: number;
  onOpacidade: (v: number) => void;
  preset: PresetCamera;
  onPreset: (p: PresetCamera) => void;
  ruaFoco: string;
  onRuaFoco: (r: string) => void;
  localizacoes: Localizacao[];
  movimentos: MovimentoEstoque[];
}

const MODOS: { id: ModoHeatmap; label: string }[] = [
  { id: "abc", label: "Curva ABC" },
  { id: "ocupacao", label: "Ocupação" },
  { id: "atividade", label: "Atividade ao vivo" },
];

const PRESETS: { id: PresetCamera; label: string; icon: typeof Box }[] = [
  { id: "isometrica", label: "Isométrica", icon: Box },
  { id: "topo", label: "Topo", icon: LayoutGrid },
  { id: "corredor", label: "Corredor", icon: Move3d },
];

export function HeatmapLegendHud({
  modo,
  onModo,
  opacidade,
  onOpacidade,
  preset,
  onPreset,
  ruaFoco,
  onRuaFoco,
  localizacoes,
  movimentos,
}: HudProps) {
  const agora = useAgora(1000);

  const ranking = useMemo(() => {
    const ultimaAtividade = mapaUltimaAtividade(movimentos);
    return RUAS_ORDEM.map((rua) => {
      const daRua = localizacoes.filter((l) => l.rua === rua);
      const ocupadas = daRua.filter((l) => l.status === "ocupado").length;
      const atividade = daRua.reduce((acc, l) => acc + intensidadeAtividade(l.id, ultimaAtividade, agora), 0);
      return { rua, ocupacaoPct: daRua.length ? Math.round((ocupadas / daRua.length) * 100) : 0, atividade };
    }).sort((a, b) => (modo === "atividade" ? b.atividade - a.atividade : b.ocupacaoPct - a.ocupacaoPct));
  }, [localizacoes, movimentos, modo, agora]);

  return (
    <div className="pointer-events-none absolute inset-0 p-4 flex flex-col justify-between">
      <div className="pointer-events-auto flex flex-wrap items-start gap-3">
        <div className="rounded-(--radius-md) bg-(--girou-ink)/90 backdrop-blur border border-white/10 p-3 flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Câmera</span>
          <div className="flex gap-1.5">
            {PRESETS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onPreset(id)}
                title={label}
                className={clsx(
                  "flex items-center gap-1.5 rounded-(--radius-sm) px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  preset === id ? "bg-brand-bronze-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
          {preset === "corredor" && (
            <select
              value={ruaFoco}
              onChange={(e) => onRuaFoco(e.target.value)}
              className="rounded-(--radius-sm) bg-white/10 text-white text-xs px-2 py-1.5 outline-none"
            >
              {RUAS_ORDEM.map((r) => (
                <option key={r} value={r} className="text-black">
                  Rua {r}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-(--radius-md) bg-(--girou-ink)/90 backdrop-blur border border-white/10 p-3 flex flex-col gap-2 min-w-[180px]">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Modo do heatmap</span>
          <div className="flex flex-col gap-1">
            {MODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => onModo(m.id)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-(--radius-sm) px-2.5 py-1.5 text-xs font-medium text-left transition-colors cursor-pointer",
                  modo === m.id ? "bg-brand-bronze-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {m.id === "atividade" && <Radio size={12} />}
                {m.label}
              </button>
            ))}
          </div>
          <label className="text-[10px] text-white/50 flex flex-col gap-1 mt-1">
            Opacidade do heatmap
            <input
              type="range"
              min={20}
              max={100}
              value={Math.round(opacidade * 100)}
              onChange={(e) => onOpacidade(Number(e.target.value) / 100)}
              className="accent-[var(--girou-purple)]"
            />
          </label>
        </div>
      </div>

      <div className="pointer-events-auto self-end rounded-(--radius-md) bg-(--girou-ink)/90 backdrop-blur border border-white/10 p-3 w-48">
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Top ruas</span>
        <div className="flex flex-col gap-1.5 mt-2">
          {ranking.slice(0, 5).map((r, i) => (
            <div key={r.rua} className="flex items-center justify-between text-xs text-white/80">
              <span>
                {i + 1}. Rua {r.rua}
              </span>
              <span className="tabular text-white/50">
                {modo === "atividade" ? r.atividade.toFixed(1) : `${r.ocupacaoPct}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
