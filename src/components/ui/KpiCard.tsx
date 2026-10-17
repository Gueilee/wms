import { ReactNode } from "react";
import clsx from "clsx";

interface KpiCardProps {
  rotulo: string;
  valor: string;
  variacao?: string;
  tomVariacao?: "ok" | "atencao" | "critico" | "neutro";
  icone?: ReactNode;
  destaque?: boolean;
}

export function KpiCard({ rotulo, valor, variacao, tomVariacao = "neutro", icone, destaque }: KpiCardProps) {
  return (
    <div
      className={clsx(
        "rounded-(--radius-lg) border border-border bg-surface p-5 flex flex-col gap-3",
        destaque && "ring-1 ring-brand-bronze-500/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted font-medium">{rotulo}</span>
        {icone && <div className="text-brand-bronze-500">{icone}</div>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-3xl font-bold tabular tracking-tight">{valor}</span>
        {variacao && (
          <span
            className={clsx(
              "text-xs font-semibold pb-1",
              tomVariacao === "ok" && "text-status-ok",
              tomVariacao === "atencao" && "text-status-blocked",
              tomVariacao === "critico" && "text-status-critical",
              tomVariacao === "neutro" && "text-text-faint"
            )}
          >
            {variacao}
          </span>
        )}
      </div>
    </div>
  );
}
