"use client";

import clsx from "clsx";
import type { Localizacao } from "@/types";

function corCelula(loc: Localizacao, selecionada: boolean) {
  if (selecionada) return "ring-2 ring-offset-1 ring-brand-green-600";
  return "";
}

function fundoCelula(loc: Localizacao) {
  if (loc.status === "bloqueado") return "bg-status-blocked/80 text-white";
  if (loc.status === "ocupado") return "bg-brand-bronze-500 text-white";
  return "bg-surface-muted text-text-faint border border-dashed border-border";
}

export function RuaBlock({
  rua,
  localizacoes,
  selecionadaId,
  onSelecionar,
}: {
  rua: string;
  localizacoes: Localizacao[];
  selecionadaId?: string;
  onSelecionar: (loc: Localizacao) => void;
}) {
  const alturas = Array.from(new Set(localizacoes.map((l) => l.altura))).sort().reverse();
  const ocupadas = localizacoes.filter((l) => l.status === "ocupado").length;

  return (
    <div className="rounded-(--radius-md) border border-border bg-surface p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-sm">Rua {rua}</span>
        <span className="text-[11px] text-text-faint tabular">
          {ocupadas}/{localizacoes.length}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {alturas.map((altura) => {
          const posicoes = localizacoes
            .filter((l) => l.altura === altura)
            .sort((a, b) => Number(a.posicao) - Number(b.posicao));
          return (
            <div key={altura} className="flex items-center gap-1">
              <span className="text-[10px] text-text-faint w-5 shrink-0 tabular">{altura}</span>
              <div className="flex flex-wrap gap-1">
                {posicoes.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    title={loc.codigo}
                    onClick={() => onSelecionar(loc)}
                    className={clsx(
                      "h-5 w-5 rounded-[4px] text-[0px] cursor-pointer transition-transform hover:scale-110",
                      fundoCelula(loc),
                      corCelula(loc, loc.id === selecionadaId)
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
