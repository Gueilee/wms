"use client";

import { useState } from "react";
import { ClipboardList, ScanBarcode, PackageOpen, Tag } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LABEL_STATUS_PEDIDO } from "@/lib/constants";
import { CLIENTES } from "@/data/seed/clients";
import { gerarConteudoGs1 } from "@/lib/gs1";
import { formatarNumero } from "@/lib/format";

export default function SeparacaoPage() {
  const { pedidos, itens, iniciarSeparacao, confirmarPick, embalarPedido } = useWmsStore();
  const [etiquetaAberta, setEtiquetaAberta] = useState<string | null>(null);

  const emAndamento = pedidos.filter((p) => p.status !== "expedido");

  return (
    <div>
      <PageHeader
        titulo="Separação & Packing"
        descricao="Picking guiado por pedido, com baixa automática de estoque e geração de etiqueta GS1-128 no empacotamento."
      />

      <div className="flex flex-col gap-4">
        {emAndamento.map((pedido) => {
          const cliente = CLIENTES.find((c) => c.id === pedido.clienteId);
          const totalItens = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0);
          const totalSeparado = pedido.itens.reduce((acc, i) => acc + i.quantidadeSeparada, 0);
          const pct = totalItens ? Math.round((totalSeparado / totalItens) * 100) : 0;

          return (
            <Card key={pedido.id} padded={false} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-brand-bronze-500" />
                  <div>
                    <p className="font-display font-semibold text-sm">
                      {pedido.numero} · <span className="text-text-muted font-normal">{cliente?.nome}</span>
                    </p>
                    <p className="text-xs text-text-muted">Previsto para {pedido.dataPrevista}</p>
                  </div>
                </div>
                <Badge tom={pedido.status === "embalado" ? "ok" : pedido.status === "separado" ? "info" : "neutro"}>
                  {LABEL_STATUS_PEDIDO[pedido.status]}
                </Badge>
              </div>

              <div className="px-5 py-4 flex flex-col gap-4">
                {pedido.status === "aberto" && (
                  <button
                    onClick={() => iniciarSeparacao(pedido.id)}
                    className="self-start rounded-(--radius-md) bg-brand-green-700 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer hover:bg-brand-green-600 transition-colors flex items-center gap-2"
                  >
                    <ScanBarcode size={15} /> Iniciar separação
                  </button>
                )}

                {(pedido.status === "separando" || pedido.status === "separado") && (
                  <>
                    <ProgressBar percentual={pct} tom={pct === 100 ? "ok" : "bronze"} />
                    <div className="flex flex-col divide-y divide-border">
                      {pedido.itens.map((linha) => {
                        const item = itens.find((i) => i.id === linha.itemId);
                        if (!item) return null;
                        const completo = linha.quantidadeSeparada >= linha.quantidade;
                        return (
                          <div key={linha.itemId} className="py-2.5 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-text">{item.nome}</p>
                              <p className="text-xs text-text-faint tabular">
                                {formatarNumero(linha.quantidadeSeparada)} / {formatarNumero(linha.quantidade)} {item.unidadeMedida}
                              </p>
                            </div>
                            {completo ? (
                              <Badge tom="ok">Separado</Badge>
                            ) : (
                              <button
                                onClick={() => confirmarPick(pedido.id, item.id, linha.quantidade - linha.quantidadeSeparada)}
                                className="rounded-(--radius-md) border border-brand-bronze-500 text-brand-bronze-600 text-xs font-semibold px-3 py-1.5 cursor-pointer hover:bg-brand-bronze-50 transition-colors flex items-center gap-1.5"
                              >
                                <ScanBarcode size={13} /> Escanear item
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {pedido.status === "separado" && (
                  <button
                    onClick={() => embalarPedido(pedido.id)}
                    className="self-start rounded-(--radius-md) bg-brand-bronze-600 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer hover:bg-brand-bronze-500 transition-colors flex items-center gap-2"
                  >
                    <PackageOpen size={15} /> Embalar pedido
                  </button>
                )}

                {pedido.status === "embalado" && (
                  <div className="flex items-center gap-3">
                    <Badge tom="ok">Pronto para expedição</Badge>
                    <button
                      onClick={() => setEtiquetaAberta(etiquetaAberta === pedido.id ? null : pedido.id)}
                      className="text-xs font-semibold text-brand-bronze-600 flex items-center gap-1.5 cursor-pointer hover:underline"
                    >
                      <Tag size={13} /> {etiquetaAberta === pedido.id ? "Ocultar etiquetas" : "Ver etiquetas geradas"}
                    </button>
                  </div>
                )}

                {etiquetaAberta === pedido.id && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {pedido.itens.map((linha) => {
                      const item = itens.find((i) => i.id === linha.itemId);
                      if (!item) return null;
                      return (
                        <div key={linha.itemId} className="rounded-(--radius-md) border border-dashed border-border p-3 font-mono text-[11px] bg-surface-muted">
                          <p className="font-sans font-semibold text-xs text-text mb-1 truncate">{item.nome}</p>
                          {gerarConteudoGs1(item, linha.quantidade)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {emAndamento.length === 0 && (
          <Card>
            <p className="text-sm text-text-faint text-center py-6">Todos os pedidos já foram expedidos.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
