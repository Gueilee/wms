import clsx from "clsx";

export function ProgressBar({ percentual, tom = "bronze" }: { percentual: number; tom?: "bronze" | "ok" | "atencao" | "critico" }) {
  const cor =
    tom === "ok"
      ? "bg-status-ok"
      : tom === "atencao"
        ? "bg-status-blocked"
        : tom === "critico"
          ? "bg-status-critical"
          : "bg-brand-bronze-500";

  return (
    <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
      <div
        className={clsx("h-full rounded-full transition-all duration-300", cor)}
        style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
      />
    </div>
  );
}
