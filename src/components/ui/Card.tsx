import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={clsx("rounded-(--radius-lg) border border-border bg-surface", padded && "p-5", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">{titulo}</h1>
        {descricao && <p className="text-sm text-text-muted mt-1 max-w-2xl">{descricao}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2 shrink-0">{acoes}</div>}
    </div>
  );
}
