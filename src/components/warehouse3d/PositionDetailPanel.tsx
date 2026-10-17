import type { ReactNode } from "react";
import type { ContagemInventario, Item, Localizacao, Lote, MovimentoEstoque } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatarData, formatarDataHora, formatarNumero, formatarTempoDecorrido } from "@/lib/format";
import { intensidadeAtividade, mapaUltimaAtividade } from "@/lib/heatmap";
import { useAgora } from "@/hooks/useAgora";
import { Activity, ArrowDownUp, ClipboardCheck, Clock, MapPin, Package, Radio } from "lucide-react";

const LABEL_TIPO: Record<string, string> = {
  recebimento: "Recebimento",
  putaway: "Endereçamento",
  picking: "Separação",
  packing: "Embalagem",
  expedicao: "Expedição",
  inventario: "Inventário",
  ajuste: "Ajuste de saldo",
};

interface PositionDetailPanelProps {
  loc?: Localizacao;
  item?: Item;
  movimentos: MovimentoEstoque[];
  lotes: Lote[];
  contagens: ContagemInventario[];
}

function Secao({ icone: Icone, titulo, children }: { icone: typeof Package; titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-2">
        <Icone size={13} className="text-brand-bronze-500" />
        {titulo}
      </p>
      {children}
    </div>
  );
}

export function PositionDetailPanel({ loc, item, movimentos, lotes, contagens }: PositionDetailPanelProps) {
  const agora = useAgora(1000);

  if (!loc) {
    return (
      <div className="rounded-(--radius-lg) border border-dashed border-border p-6 text-center text-sm text-text-faint">
        <MapPin size={20} className="mx-auto mb-2" />
        Clique num pallet na cena 3D para ver os detalhes da posição.
      </div>
    );
  }

  const historico = movimentos.filter((m) => m.localizacaoOrigemId === loc.id || m.localizacaoDestinoId === loc.id).slice(0, 6);
  const ultimaAtividade = mapaUltimaAtividade(movimentos);
  const emAtividade = intensidadeAtividade(loc.id, ultimaAtividade, agora) > 0;
  const ocupacaoPct = loc.capacidadeUnidades ? Math.round(((loc.quantidadeArmazenada ?? 0) / loc.capacidadeUnidades) * 100) : 0;

  // Entradas / FIFO: lotes reais para itens rastreáveis, senão o histórico de
  // putaway desta posição, com fallback para a data de entrada sintética do seed.
  const lotesAqui = item?.loteValidadeControlado ? lotes.filter((l) => l.localizacaoId === loc.id) : [];
  const entradasPutaway = movimentos
    .filter((m) => m.tipo === "putaway" && m.localizacaoDestinoId === loc.id)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const ultimaContagem = contagens
    .filter((c) => c.localizacaoId === loc.id && c.timestamp)
    .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())[0];

  const tempoParadoDesde = loc.ultimaMovimentacaoEm ?? loc.dataEntradaAtual;

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg tabular">{loc.codigo}</h3>
        {emAtividade && (
          <Badge tom="critico" className="animate-pulse">
            <Radio size={12} /> Atividade agora
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge tom={loc.status === "ocupado" ? "bronze" : loc.status === "bloqueado" ? "atencao" : "ok"}>
          {loc.status === "ocupado" ? "Ocupado" : loc.status === "bloqueado" ? "Bloqueado" : "Livre"}
        </Badge>
        {item && <Badge tom={item.classeAbc === "A" ? "ok" : item.classeAbc === "B" ? "info" : "neutro"}>Classe {item.classeAbc}</Badge>}
        {tempoParadoDesde && (
          <Badge tom="neutro">
            <Clock size={12} /> parado {formatarTempoDecorrido(tempoParadoDesde, agora)}
          </Badge>
        )}
      </div>

      {item && (
        <Secao icone={Package} titulo="Produto na posição">
          <p className="text-sm font-medium text-text">{item.nome}</p>
          <p className="text-xs text-text-muted mb-2">{item.categoria}</p>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Ocupação</span>
            <span className="tabular">
              {formatarNumero(loc.quantidadeArmazenada ?? 0)} / {formatarNumero(loc.capacidadeUnidades)}
            </span>
          </div>
          <ProgressBar percentual={ocupacaoPct} tom={ocupacaoPct > 90 ? "atencao" : "bronze"} />
        </Secao>
      )}

      <Secao icone={ArrowDownUp} titulo="Entradas / FIFO">
        {lotesAqui.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {lotesAqui
              .slice()
              .sort((a, b) => new Date(a.dataFabricacao).getTime() - new Date(b.dataFabricacao).getTime())
              .map((lote, i) => (
                <div key={lote.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Lote {lote.numeroLote} · fab. {formatarData(lote.dataFabricacao)}
                  </span>
                  {i === 0 && <Badge tom="atencao">Próximo a sair</Badge>}
                </div>
              ))}
          </div>
        ) : entradasPutaway.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {entradasPutaway.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{formatarDataHora(m.timestamp)}</span>
                {i === 0 && <Badge tom="atencao">Próximo a sair (FIFO)</Badge>}
              </div>
            ))}
          </div>
        ) : loc.dataEntradaAtual ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">{formatarDataHora(loc.dataEntradaAtual)} (histórico)</span>
            <Badge tom="atencao">Próximo a sair (FIFO)</Badge>
          </div>
        ) : (
          <p className="text-xs text-text-faint">Sem registro de entrada.</p>
        )}
      </Secao>

      <Secao icone={Activity} titulo="Última movimentação">
        {historico.length === 0 ? (
          <p className="text-xs text-text-faint">Nenhuma movimentação registrada nesta sessão.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {historico.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{LABEL_TIPO[m.tipo] ?? m.tipo}</span>
                <span className="tabular text-text-faint">{formatarDataHora(m.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </Secao>

      <Secao icone={ClipboardCheck} titulo="Último inventário contado">
        {ultimaContagem ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Sistema {formatarNumero(ultimaContagem.saldoSistema)} · Contado {formatarNumero(ultimaContagem.saldoContado ?? 0)}
            </span>
            <Badge tom={ultimaContagem.status === "divergente" ? "atencao" : "ok"}>{formatarDataHora(ultimaContagem.timestamp!)}</Badge>
          </div>
        ) : (
          <p className="text-xs text-text-faint">Nunca contada.</p>
        )}
      </Secao>
    </div>
  );
}
