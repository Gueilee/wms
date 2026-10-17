import type { Item, Localizacao, MovimentoEstoque } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatarNumero } from "@/lib/format";
import { intensidadeAtividade, mapaUltimaAtividade } from "@/lib/heatmap";
import { useAgora } from "@/hooks/useAgora";
import { MapPin, Radio } from "lucide-react";

const LABEL_TIPO: Record<string, string> = {
  recebimento: "Recebimento",
  putaway: "Endereçamento",
  picking: "Separação",
  packing: "Embalagem",
  expedicao: "Expedição",
  inventario: "Inventário",
  ajuste: "Ajuste de saldo",
};

export function PositionDetailPanel({
  loc,
  item,
  movimentos,
}: {
  loc?: Localizacao;
  item?: Item;
  movimentos: MovimentoEstoque[];
}) {
  const agora = useAgora(1000);

  if (!loc) {
    return (
      <div className="rounded-(--radius-lg) border border-dashed border-border p-6 text-center text-sm text-text-faint">
        <MapPin size={20} className="mx-auto mb-2" />
        Clique num pallet na cena 3D para ver os detalhes da posição.
      </div>
    );
  }

  const historico = movimentos
    .filter((m) => m.localizacaoOrigemId === loc.id || m.localizacaoDestinoId === loc.id)
    .slice(0, 6);

  const ultimaAtividade = mapaUltimaAtividade(movimentos);
  const emAtividade = intensidadeAtividade(loc.id, ultimaAtividade, agora) > 0;
  const ocupacaoPct = loc.capacidadeUnidades ? Math.round(((loc.quantidadeArmazenada ?? 0) / loc.capacidadeUnidades) * 100) : 0;

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg tabular">{loc.codigo}</h3>
        {emAtividade && (
          <Badge tom="critico" className="animate-pulse">
            <Radio size={12} /> Atividade agora
          </Badge>
        )}
      </div>

      <Badge tom={loc.status === "ocupado" ? "bronze" : loc.status === "bloqueado" ? "atencao" : "ok"}>
        {loc.status === "ocupado" ? "Ocupado" : loc.status === "bloqueado" ? "Bloqueado" : "Livre"}
      </Badge>

      {item && (
        <div>
          <p className="text-sm font-medium text-text">{item.nome}</p>
          <p className="text-xs text-text-muted mb-2">
            {item.categoria} · Classe {item.classeAbc}
          </p>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Ocupação</span>
            <span className="tabular">
              {formatarNumero(loc.quantidadeArmazenada ?? 0)} / {formatarNumero(loc.capacidadeUnidades)}
            </span>
          </div>
          <ProgressBar percentual={ocupacaoPct} tom={ocupacaoPct > 90 ? "atencao" : "bronze"} />
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-text-muted mb-2">Histórico recente</p>
        {historico.length === 0 ? (
          <p className="text-xs text-text-faint">Nenhuma movimentação registrada nesta sessão.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {historico.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{LABEL_TIPO[m.tipo] ?? m.tipo}</span>
                <span className="tabular text-text-faint">{new Date(m.timestamp).toLocaleTimeString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
