"use client";

import { useState } from "react";
import { PackageCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatarData, formatarNumero } from "@/lib/format";

export default function RecebimentoPage() {
  const { recebimentosPendentes, itens, sugerirEndereco, confirmarPutaway } = useWmsStore();
  const [conferindo, setConferindo] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState<number>(0);
  const [confirmados, setConfirmados] = useState<Record<string, boolean>>({});

  function abrirConferencia(chave: string, quantidadeEsperada: number) {
    setConferindo(chave);
    setQuantidade(quantidadeEsperada);
  }

  return (
    <div>
      <PageHeader
        titulo="Recebimento"
        descricao="Conferência de entrada com sugestão automática de endereço — o operador só confirma."
      />

      {recebimentosPendentes.length === 0 && (
        <Card>
          <p className="text-sm text-text-faint text-center py-6">
            Nenhum recebimento pendente. Use &ldquo;Resetar demonstração&rdquo; para gerar novos recebimentos de exemplo.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-5">
        {recebimentosPendentes.map((rec) => (
          <Card key={rec.id} padded={false} className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-muted/40">
              <div className="flex items-center gap-3">
                <PackageCheck size={18} className="text-brand-bronze-500" />
                <div>
                  <p className="font-display font-semibold text-sm">{rec.numero}</p>
                  <p className="text-xs text-text-muted">{rec.fornecedorOuProducao}</p>
                </div>
              </div>
              <Badge tom="info">Previsto {formatarData(rec.dataPrevista)}</Badge>
            </div>

            <div className="divide-y divide-border">
              {rec.itens.map((linha) => {
                const item = itens.find((i) => i.id === linha.itemId);
                if (!item) return null;
                const chave = `${rec.id}-${item.id}`;
                const sugestao = sugerirEndereco(item.id);
                const estaConferindo = conferindo === chave;
                const jaConfirmado = confirmados[chave];

                return (
                  <div key={chave} className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text">{item.nome}</p>
                        <p className="text-xs text-text-muted">
                          Esperado: {formatarNumero(linha.quantidadeEsperada)} {item.unidadeMedida}
                        </p>
                      </div>
                      {jaConfirmado ? (
                        <Badge tom="ok">
                          <CheckCircle2 size={13} /> Endereçado
                        </Badge>
                      ) : !estaConferindo ? (
                        <button
                          onClick={() => abrirConferencia(chave, linha.quantidadeEsperada)}
                          className="rounded-(--radius-md) bg-brand-green-700 text-white text-xs font-semibold px-3 py-2 cursor-pointer hover:bg-brand-green-600 transition-colors"
                        >
                          Conferir e endereçar
                        </button>
                      ) : null}
                    </div>

                    {estaConferindo && (
                      <div className="rounded-(--radius-md) border border-border bg-surface-muted/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">Quantidade conferida</span>
                          <input
                            type="number"
                            value={quantidade}
                            onChange={(e) => setQuantidade(Number(e.target.value))}
                            className="w-24 rounded-(--radius-sm) border border-border bg-bg px-2 py-1.5 text-sm tabular outline-none focus:ring-2 focus:ring-brand-bronze-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight size={14} className="text-text-faint" />
                          <span className="text-text-muted">Sugestão do sistema:</span>
                          <Badge tom="bronze">{sugestao?.codigo ?? "sem posição livre"}</Badge>
                        </div>
                        <button
                          disabled={!sugestao}
                          onClick={() => {
                            if (!sugestao) return;
                            confirmarPutaway(rec.id, item.id, quantidade, sugestao.id);
                            setConfirmados((s) => ({ ...s, [chave]: true }));
                            setConferindo(null);
                          }}
                          className="ml-auto rounded-(--radius-md) bg-brand-bronze-600 text-white text-xs font-semibold px-3 py-2 cursor-pointer hover:bg-brand-bronze-500 transition-colors disabled:opacity-50"
                        >
                          Confirmar endereçamento
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
