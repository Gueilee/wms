"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader } from "@/components/ui/Card";
import { HeatmapLegendHud } from "@/components/warehouse3d/HeatmapLegendHud";
import { PositionDetailPanel } from "@/components/warehouse3d/PositionDetailPanel";
import type { PresetCamera } from "@/components/warehouse3d/CameraRig";
import type { ModoHeatmap } from "@/lib/heatmap";
import type { Localizacao } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";

const WarehouseScene = dynamic(
  () => import("@/components/warehouse3d/WarehouseScene").then((m) => m.WarehouseScene),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center text-text-faint text-sm">Carregando cena 3D…</div> }
);

export default function Mapa3dPage() {
  const { localizacoes, itens, movimentos, lotes, contagens } = useWmsStore();
  const [modo, setModo] = useState<ModoHeatmap>("abc");
  const [opacidade, setOpacidade] = useState(0.9);
  const [preset, setPreset] = useState<PresetCamera>("isometrica");
  const [ruaFoco, setRuaFoco] = useState<string>(RUAS_ORDEM[0]);
  const [selecionada, setSelecionada] = useState<Localizacao | undefined>();
  const [telaCheia, setTelaCheia] = useState(false);

  const itemSelecionado = selecionada?.itemId ? itens.find((i) => i.id === selecionada.itemId) : undefined;

  const cena = (
    <div className="relative rounded-(--radius-lg) overflow-hidden border border-border flex-1 min-h-[420px]">
      <WarehouseScene
        localizacoes={localizacoes}
        itens={itens}
        movimentos={movimentos}
        modo={modo}
        opacidade={opacidade}
        preset={preset}
        ruaFoco={ruaFoco}
        selecionadaId={selecionada?.id}
        onSelecionar={setSelecionada}
      />
      <HeatmapLegendHud
        modo={modo}
        onModo={setModo}
        opacidade={opacidade}
        onOpacidade={setOpacidade}
        preset={preset}
        onPreset={setPreset}
        ruaFoco={ruaFoco}
        onRuaFoco={setRuaFoco}
        localizacoes={localizacoes}
        movimentos={movimentos}
        telaCheia={telaCheia}
        onTelaCheia={() => setTelaCheia((v) => !v)}
      />
    </div>
  );

  const painel = (
    <div className={clsx("overflow-y-auto", telaCheia ? "w-80 shrink-0" : "")}>
      <PositionDetailPanel loc={selecionada} item={itemSelecionado} movimentos={movimentos} lotes={lotes} contagens={contagens} />
    </div>
  );

  if (telaCheia) {
    return (
      <div className="fixed inset-0 z-50 bg-bg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-text">Mapa 3D do armazém — tela cheia</p>
          <button
            onClick={() => setTelaCheia(false)}
            className="flex items-center gap-1.5 rounded-(--radius-md) border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={14} /> Fechar
          </button>
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          {cena}
          {painel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      <PageHeader
        titulo="Mapa 3D do armazém"
        descricao="Gêmeo digital do galpão real — heatmap por curva ABC, ocupação, atividade ao vivo ou movimentação histórica, exatamente sobre a topologia das 9 ruas."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 flex-1 min-h-0">
        {cena}
        {painel}
      </div>
    </div>
  );
}
