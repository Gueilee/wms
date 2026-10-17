import type { Item, Localizacao } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatarNumero } from "@/lib/format";
import { MapPin } from "lucide-react";

export function LocationDetailPanel({ loc, item }: { loc?: Localizacao; item?: Item }) {
  if (!loc) {
    return (
      <div className="rounded-(--radius-lg) border border-dashed border-border p-6 text-center text-sm text-text-faint">
        <MapPin size={20} className="mx-auto mb-2" />
        Clique em uma posição do mapa para ver os detalhes.
      </div>
    );
  }

  const ocupacaoPct = loc.capacidadeUnidades ? Math.round(((loc.quantidadeArmazenada ?? 0) / loc.capacidadeUnidades) * 100) : 0;

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg tabular">{loc.codigo}</h3>
        <Badge tom={loc.status === "ocupado" ? "bronze" : loc.status === "bloqueado" ? "atencao" : "ok"}>
          {loc.status === "ocupado" ? "Ocupado" : loc.status === "bloqueado" ? "Bloqueado" : "Livre"}
        </Badge>
      </div>

      {loc.status === "bloqueado" && <p className="text-sm text-status-blocked">{loc.motivoBloqueio}</p>}

      {item ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text">{item.nome}</p>
          <p className="text-xs text-text-muted">
            {item.categoria} · Classe {item.classeAbc}
          </p>
          <div className="mt-1">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Ocupação da posição</span>
              <span className="tabular">
                {formatarNumero(loc.quantidadeArmazenada ?? 0)} / {formatarNumero(loc.capacidadeUnidades)}
              </span>
            </div>
            <ProgressBar percentual={ocupacaoPct} tom={ocupacaoPct > 90 ? "atencao" : "bronze"} />
          </div>
        </div>
      ) : loc.status === "livre" ? (
        <p className="text-sm text-text-muted">
          Posição disponível — capacidade para {formatarNumero(loc.capacidadeUnidades)} unidades.
        </p>
      ) : null}
    </div>
  );
}
