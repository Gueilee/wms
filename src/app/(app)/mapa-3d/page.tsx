"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
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
  const { localizacoes, itens, movimentos } = useWmsStore();
  const [modo, setModo] = useState<ModoHeatmap>("abc");
  const [opacidade, setOpacidade] = useState(0.9);
  const [preset, setPreset] = useState<PresetCamera>("isometrica");
  const [ruaFoco, setRuaFoco] = useState<string>(RUAS_ORDEM[0]);
  const [selecionada, setSelecionada] = useState<Localizacao | undefined>();

  const itemSelecionado = selecionada?.itemId ? itens.find((i) => i.id === selecionada.itemId) : undefined;

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      <PageHeader
        titulo="Mapa 3D do armazém"
        descricao="Gêmeo digital do galpão real — heatmap por curva ABC, ocupação ou atividade ao vivo, exatamente sobre a topologia das 9 ruas."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 flex-1 min-h-0">
        <div className="relative rounded-(--radius-lg) overflow-hidden border border-border min-h-[420px]">
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
          />
        </div>

        <div className="overflow-y-auto">
          <PositionDetailPanel loc={selecionada} item={itemSelecionado} movimentos={movimentos} />
        </div>
      </div>
    </div>
  );
}
