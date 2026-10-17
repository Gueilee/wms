import { ReactNode } from "react";
import clsx from "clsx";

type Tom = "neutro" | "ok" | "atencao" | "critico" | "info" | "bronze";

const TONS: Record<Tom, string> = {
  neutro: "bg-surface-muted text-text-muted border-border",
  ok: "bg-status-ok/15 text-status-ok border-status-ok/30",
  atencao: "bg-status-blocked/15 text-status-blocked border-status-blocked/30",
  critico: "bg-status-critical/15 text-status-critical border-status-critical/30",
  info: "bg-status-info/15 text-status-info border-status-info/30",
  bronze: "bg-brand-bronze-500/15 text-brand-bronze-700 border-brand-bronze-500/30",
};

export function Badge({ tom = "neutro", children, className }: { tom?: Tom; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONS[tom],
        className
      )}
    >
      {children}
    </span>
  );
}
