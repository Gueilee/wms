"use client";

import { Bell, EyeOff } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAlertasAtivos } from "@/lib/selectors";
import { formatarData } from "@/lib/format";

const LABEL_TIPO: Record<string, string> = {
  estoque_baixo: "Estoque baixo",
  validade_proxima: "Validade próxima",
  divergencia_inventario: "Divergência de inventário",
  pedido_atrasado: "Pedido atrasado",
  posicao_bloqueada: "Posição bloqueada",
};

export default function AlertasPage() {
  const { itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados, ignorarAlerta } = useWmsStore();
  const alertas = useAlertasAtivos(itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados);

  const ordenados = [...alertas].sort((a, b) => {
    const ordem = { critico: 0, atencao: 1, info: 2 };
    return ordem[a.severidade] - ordem[b.severidade];
  });

  return (
    <div>
      <PageHeader titulo="Central de alertas" descricao="Exceções detectadas automaticamente a partir do estado atual do armazém." />

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Bell size={16} className="text-brand-bronze-500" />
          <h3 className="font-display font-semibold text-sm">{ordenados.length} alerta(s) ativo(s)</h3>
        </div>
        <div className="divide-y divide-border">
          {ordenados.map((a) => (
            <div key={a.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Badge tom={a.severidade === "critico" ? "critico" : a.severidade === "atencao" ? "atencao" : "info"}>
                  {LABEL_TIPO[a.tipo]}
                </Badge>
                <div>
                  <p className="text-sm text-text">{a.mensagem}</p>
                  <p className="text-xs text-text-faint mt-0.5">{formatarData(a.timestamp.slice(0, 10))}</p>
                </div>
              </div>
              <button
                onClick={() => ignorarAlerta(a.id)}
                className="shrink-0 flex items-center gap-1.5 text-xs text-text-faint hover:text-text-muted cursor-pointer"
                title="Dispensar alerta"
              >
                <EyeOff size={14} /> Dispensar
              </button>
            </div>
          ))}
          {ordenados.length === 0 && <p className="text-sm text-text-faint text-center py-10">Nenhum alerta ativo — tudo sob controle.</p>}
        </div>
      </Card>
    </div>
  );
}
