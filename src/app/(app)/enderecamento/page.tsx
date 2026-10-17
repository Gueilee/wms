"use client";

import { useState } from "react";
import Link from "next/link";
import { Box } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { RuaBlock } from "@/components/warehouse/RuaBlock";
import { LocationDetailPanel } from "@/components/warehouse/LocationDetailPanel";
import { calcularOcupacao } from "@/lib/selectors";
import { RUAS_ORDEM } from "@/data/seed/layout";
import type { Localizacao } from "@/types";

export default function EnderecamentoPage() {
  const { localizacoes, itens } = useWmsStore();
  const [selecionada, setSelecionada] = useState<Localizacao | undefined>();

  const ocupacao = calcularOcupacao(localizacoes);
  const itemSelecionado = selecionada?.itemId ? itens.find((i) => i.id === selecionada.itemId) : undefined;

  return (
    <div>
      <PageHeader
        titulo="Mapa de endereçamento"
        descricao={`Réplica do layout físico real do armazém — padrão RUA.ALTURA.POSIÇÃO, 9 ruas, ${ocupacao.total} posições.`}
        acoes={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-brand-bronze-500" /> Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-surface-muted border border-dashed border-border" /> Livre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-status-blocked/80" /> Bloqueado
              </span>
            </div>
            <Link
              href="/mapa-3d"
              className="flex items-center gap-1.5 rounded-(--radius-md) bg-brand-green-700 text-white text-xs font-semibold px-3 py-2 hover:bg-brand-green-600 transition-colors"
            >
              <Box size={14} /> Ver em 3D
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RUAS_ORDEM.map((rua) => (
            <RuaBlock
              key={rua}
              rua={rua}
              localizacoes={localizacoes.filter((l) => l.rua === rua)}
              selecionadaId={selecionada?.id}
              onSelecionar={setSelecionada}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <LocationDetailPanel loc={selecionada} item={itemSelecionado} />
          <Card>
            <h4 className="font-display font-semibold text-sm mb-3">Resumo geral</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Ocupadas</span>
                <span className="tabular font-semibold">{ocupacao.ocupadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Livres</span>
                <span className="tabular font-semibold">{ocupacao.livres}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bloqueadas</span>
                <span className="tabular font-semibold">{ocupacao.bloqueadas}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-1">
                <span className="text-text-muted">Taxa de ocupação</span>
                <span className="tabular font-bold text-brand-bronze-600">{ocupacao.percentual}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
