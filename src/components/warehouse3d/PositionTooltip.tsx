"use client";

import type { Item, Localizacao } from "@/types";
import { formatarNumero } from "@/lib/format";

export function PositionTooltip({ loc, itens, x, y }: { loc: Localizacao; itens: Item[]; x: number; y: number }) {
  const item = loc.itemId ? itens.find((i) => i.id === loc.itemId) : undefined;

  return (
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-(--radius-md) border border-brand-bronze-300/40 bg-(--girou-ink)/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur"
      style={{ left: x, top: y }}
    >
      <p className="font-display font-bold tabular">{loc.codigo}</p>
      {item ? (
        <>
          <p className="text-white/80">{item.nome}</p>
          <p className="tabular text-white/60">
            {formatarNumero(item.saldoDisponivel)} {item.unidadeMedida} · Classe {item.classeAbc}
          </p>
        </>
      ) : (
        <p className="text-white/60">{loc.status === "bloqueado" ? "Bloqueada" : "Livre"}</p>
      )}
    </div>
  );
}
