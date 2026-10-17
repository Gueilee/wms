"use client";

import { useState } from "react";
import { Truck, CheckCircle2 } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CLIENTES } from "@/data/seed/clients";
import { formatarData } from "@/lib/format";

const TRANSPORTADORAS = ["Transul Logística", "Rápido Vale Express", "Frota própria Braspel"];

export default function ExpedicaoPage() {
  const { pedidos, expedirPedido } = useWmsStore();
  const [transportadoraPorPedido, setTransportadoraPorPedido] = useState<Record<string, string>>({});

  const prontosParaExpedir = pedidos.filter((p) => p.status === "embalado");
  const expedidos = pedidos.filter((p) => p.status === "expedido");

  return (
    <div>
      <PageHeader titulo="Expedição" descricao="Romaneio de carga e confirmação de saída do armazém." />

      <Card padded={false} className="mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Truck size={16} className="text-brand-bronze-500" />
          <h3 className="font-display font-semibold text-sm">Prontos para expedição</h3>
        </div>
        <div className="divide-y divide-border">
          {prontosParaExpedir.map((pedido) => {
            const cliente = CLIENTES.find((c) => c.id === pedido.clienteId);
            return (
              <div key={pedido.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">
                    {pedido.numero} · <span className="text-text-muted font-normal">{cliente?.nome}</span>
                  </p>
                  <p className="text-xs text-text-muted">{pedido.itens.length} item(ns) · previsto {formatarData(pedido.dataPrevista)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={transportadoraPorPedido[pedido.id] ?? TRANSPORTADORAS[0]}
                    onChange={(e) => setTransportadoraPorPedido((s) => ({ ...s, [pedido.id]: e.target.value }))}
                    className="rounded-(--radius-md) border border-border bg-bg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-bronze-500"
                  >
                    {TRANSPORTADORAS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => expedirPedido(pedido.id, transportadoraPorPedido[pedido.id] ?? TRANSPORTADORAS[0])}
                    className="rounded-(--radius-md) bg-brand-green-700 text-white text-xs font-semibold px-3 py-2 cursor-pointer hover:bg-brand-green-600 transition-colors"
                  >
                    Confirmar expedição
                  </button>
                </div>
              </div>
            );
          })}
          {prontosParaExpedir.length === 0 && <p className="text-sm text-text-faint text-center py-6">Nenhum pedido embalado aguardando expedição.</p>}
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <CheckCircle2 size={16} className="text-status-ok" />
          <h3 className="font-display font-semibold text-sm">Histórico de expedições</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs text-text-faint">
              <th className="px-5 py-2 font-medium">Pedido</th>
              <th className="px-5 py-2 font-medium">Cliente</th>
              <th className="px-5 py-2 font-medium">Transportadora</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {expedidos.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-2.5">{p.numero}</td>
                <td className="px-5 py-2.5 text-text-muted">{CLIENTES.find((c) => c.id === p.clienteId)?.nome}</td>
                <td className="px-5 py-2.5 text-text-muted">{p.transportadora}</td>
                <td className="px-5 py-2.5">
                  <Badge tom="ok">Expedido</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expedidos.length === 0 && <p className="text-sm text-text-faint text-center py-6">Nenhuma expedição ainda.</p>}
      </Card>
    </div>
  );
}
