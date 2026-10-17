"use client";

import { useState } from "react";
import { Users, Stamp, Boxes } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatarNumero } from "@/lib/format";

export default function ClientesPage() {
  const { clientes, itens, cliches } = useWmsStore();
  const [clienteAberto, setClienteAberto] = useState<string | null>(clientes[0]?.id ?? null);

  return (
    <div>
      <PageHeader
        titulo="Clientes & personalização"
        descricao="Segregação de estoque por cliente final para itens personalizados, e o clichê de impressão como ativo vinculado — não como item de estoque comum."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card padded={false} className="overflow-hidden h-fit">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <Users size={15} className="text-brand-bronze-500" />
            <h3 className="font-display font-semibold text-sm">Clientes</h3>
          </div>
          <div className="flex flex-col">
            {clientes.map((cliente) => {
              const qtdItens = itens.filter((i) => i.clienteId === cliente.id).length;
              const ativo = clienteAberto === cliente.id;
              return (
                <button
                  key={cliente.id}
                  onClick={() => setClienteAberto(cliente.id)}
                  className={`flex items-center justify-between px-4 py-3 text-left text-sm border-t border-border first:border-0 cursor-pointer transition-colors ${
                    ativo ? "bg-brand-green-700 text-white" : "hover:bg-surface-muted"
                  }`}
                >
                  <span>
                    <span className="block font-medium">{cliente.nome}</span>
                    <span className={`block text-xs ${ativo ? "text-white/70" : "text-text-faint"}`}>{cliente.segmento}</span>
                  </span>
                  <Badge tom={ativo ? "neutro" : "bronze"} className={ativo ? "bg-white/15 text-white border-white/20" : ""}>
                    {qtdItens}
                  </Badge>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {(() => {
            const cliente = clientes.find((c) => c.id === clienteAberto);
            if (!cliente) return null;
            const itensCliente = itens.filter((i) => i.clienteId === cliente.id);
            const clichesCliente = cliches.filter((c) => c.clienteId === cliente.id);

            return (
              <>
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Boxes size={15} className="text-brand-bronze-500" />
                    <h3 className="font-display font-semibold text-sm">Itens personalizados de {cliente.nome}</h3>
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {itensCliente.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                        <span>{item.nome}</span>
                        <span className="tabular text-text-muted">
                          {formatarNumero(item.saldoDisponivel)} {item.unidadeMedida}
                        </span>
                      </div>
                    ))}
                    {itensCliente.length === 0 && <p className="text-sm text-text-faint py-4">Nenhum item personalizado cadastrado.</p>}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Stamp size={15} className="text-brand-bronze-500" />
                    <h3 className="font-display font-semibold text-sm">Ferramental (clichês) vinculado</h3>
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {clichesCliente.map((c) => (
                      <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="text-text">{c.arteDescricao}</p>
                          <p className="text-xs text-text-faint">{c.localizacaoGuarda} · {c.itemIds.length} item(ns) vinculado(s)</p>
                        </div>
                        <Badge tom={c.status === "ativo" ? "ok" : "neutro"}>{c.status}</Badge>
                      </div>
                    ))}
                    {clichesCliente.length === 0 && <p className="text-sm text-text-faint py-4">Nenhum clichê vinculado a este cliente.</p>}
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
