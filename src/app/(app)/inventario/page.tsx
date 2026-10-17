"use client";

import { useState } from "react";
import { ScanLine, Wand2 } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { calcularAcuraciaInventario } from "@/lib/selectors";
import { formatarNumero } from "@/lib/format";
import type { ClasseAbc } from "@/types";

export default function InventarioPage() {
  const { itens, localizacoes, contagens, gerarContagem, registrarContagem, ajustarSaldoContagem } = useWmsStore();
  const [valores, setValores] = useState<Record<string, number>>({});

  const acuracia = calcularAcuraciaInventario(contagens);
  const pendentes = contagens.filter((c) => c.status === "pendente");
  const concluidas = contagens.filter((c) => c.status !== "pendente");

  return (
    <div>
      <PageHeader
        titulo="Inventário cíclico"
        descricao="Contagem por amostra dirigida pela curva ABC, com resolução de divergência e ajuste automático de saldo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard rotulo="Acurácia apurada" valor={acuracia === null ? "—" : `${acuracia}%`} tomVariacao={acuracia !== null && acuracia < 95 ? "atencao" : "ok"} />
        <KpiCard rotulo="Contagens pendentes" valor={formatarNumero(pendentes.length)} />
        <KpiCard rotulo="Contagens concluídas" valor={formatarNumero(concluidas.length)} />
      </div>

      <Card className="mb-6">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <Wand2 size={15} className="text-brand-bronze-500" /> Gerar nova contagem por classe
        </h3>
        <div className="flex flex-wrap gap-2">
          {(["A", "B", "C"] as ClasseAbc[]).map((c) => (
            <button
              key={c}
              onClick={() => gerarContagem(c, c === "A" ? 6 : 8)}
              className="rounded-(--radius-md) border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Amostra classe {c}
            </button>
          ))}
          <button
            onClick={() => gerarContagem(undefined, 10)}
            className="rounded-(--radius-md) bg-brand-green-700 text-white px-3 py-2 text-xs font-semibold hover:bg-brand-green-600 transition-colors cursor-pointer"
          >
            Amostra geral
          </button>
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <ScanLine size={16} className="text-brand-bronze-500" />
          <h3 className="font-display font-semibold text-sm">Contagens em aberto</h3>
        </div>
        <div className="divide-y divide-border">
          {[...pendentes, ...concluidas].map((contagem) => {
            const item = itens.find((i) => i.id === contagem.itemId);
            const loc = localizacoes.find((l) => l.id === contagem.localizacaoId);
            if (!item) return null;
            return (
              <div key={contagem.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-text">{item.nome}</p>
                  <p className="text-xs text-text-faint tabular">
                    {loc?.codigo} · sistema: {formatarNumero(contagem.saldoSistema)} {item.unidadeMedida}
                  </p>
                </div>

                {contagem.status === "pendente" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Qtd. contada"
                      value={valores[contagem.id] ?? ""}
                      onChange={(e) => setValores((s) => ({ ...s, [contagem.id]: Number(e.target.value) }))}
                      className="w-28 rounded-(--radius-sm) border border-border bg-bg px-2 py-1.5 text-sm tabular outline-none focus:ring-2 focus:ring-brand-bronze-500"
                    />
                    <button
                      onClick={() => registrarContagem(contagem.id, valores[contagem.id] ?? contagem.saldoSistema)}
                      className="rounded-(--radius-md) bg-brand-bronze-600 text-white text-xs font-semibold px-3 py-2 cursor-pointer hover:bg-brand-bronze-500 transition-colors"
                    >
                      Registrar contagem
                    </button>
                  </div>
                ) : contagem.status === "divergente" ? (
                  <div className="flex items-center gap-2">
                    <Badge tom="atencao">Divergente: contado {formatarNumero(contagem.saldoContado ?? 0)}</Badge>
                    <button
                      onClick={() => ajustarSaldoContagem(contagem.id)}
                      className="rounded-(--radius-md) border border-status-blocked text-status-blocked text-xs font-semibold px-3 py-1.5 cursor-pointer hover:bg-status-blocked/10 transition-colors"
                    >
                      Ajustar saldo
                    </button>
                  </div>
                ) : (
                  <Badge tom="ok">Conferida</Badge>
                )}
              </div>
            );
          })}
          {contagens.length === 0 && <p className="text-sm text-text-faint text-center py-8">Gere uma amostra acima para começar a contagem.</p>}
        </div>
      </Card>
    </div>
  );
}
