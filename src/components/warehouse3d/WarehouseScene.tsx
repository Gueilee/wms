"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Item, Localizacao, MovimentoEstoque } from "@/types";
import { coordenadas3d, mapaUltimaAtividade, type ModoHeatmap } from "@/lib/heatmap";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { PalletInstances } from "./PalletInstances";
import { RackFrames } from "./RackFrames";
import { Floor } from "./Floor";
import { FloorHeatmap } from "./FloorHeatmap";
import { AisleLabels } from "./AisleLabels";
import { CameraRig, type PresetCamera } from "./CameraRig";
import { PositionTooltip } from "./PositionTooltip";

interface WarehouseSceneProps {
  localizacoes: Localizacao[];
  itens: Item[];
  movimentos: MovimentoEstoque[];
  modo: ModoHeatmap;
  opacidade: number;
  preset: PresetCamera;
  ruaFoco: string;
  selecionadaId?: string;
  onSelecionar: (loc: Localizacao) => void;
}

export function WarehouseScene({
  localizacoes,
  itens,
  movimentos,
  modo,
  opacidade,
  preset,
  ruaFoco,
  selecionadaId,
  onSelecionar,
}: WarehouseSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hover, setHover] = useState<{ loc: Localizacao; x: number; y: number } | null>(null);

  const ultimaAtividade = useMemo(() => mapaUltimaAtividade(movimentos), [movimentos]);

  const { largura, profundidade } = useMemo(() => {
    let maxX = 0;
    let maxZ = 0;
    for (const loc of localizacoes) {
      const [x, , z] = coordenadas3d(loc);
      if (x > maxX) maxX = x;
      if (z > maxZ) maxZ = z;
    }
    return { largura: maxX, profundidade: maxZ };
  }, [localizacoes]);

  const ruaFocoZ = useMemo(() => {
    const idx = RUAS_ORDEM.indexOf(ruaFoco);
    return idx * 3.2;
  }, [ruaFoco]);

  function aoHover(loc: Localizacao | null, posicaoTela?: { x: number; y: number }) {
    if (!loc || !posicaoTela) {
      setHover(null);
      return;
    }
    setHover({ loc, x: posicaoTela.x, y: posicaoTela.y });
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#1c2a22] via-[#101a15] to-[#050a07]">
      <Canvas shadows camera={{ position: [16, 14, 32], fov: 45 }} dpr={[1, 1.8]} gl={{ alpha: true }}>
        <fogExp2 attach="fog" args={["#101a15", 0.013]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[18, 22, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-14, 10, -8]} intensity={0.35} color="#9fc9ff" />
        <Environment preset="city" background={false} environmentIntensity={0.35} />

        <Floor largura={largura} profundidade={profundidade} />
        {modo === "movimentacao" && <FloorHeatmap localizacoes={localizacoes} />}
        <RackFrames localizacoes={localizacoes} />
        <AisleLabels localizacoes={localizacoes} />
        <PalletInstances
          localizacoes={localizacoes}
          itens={itens}
          modo={modo}
          opacidade={opacidade}
          ultimaAtividade={ultimaAtividade}
          selecionadaId={selecionadaId}
          onSelecionar={onSelecionar}
          onHover={aoHover}
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
        <CameraRig preset={preset} ruaFocoZ={ruaFocoZ} controlsRef={controlsRef} />
      </Canvas>

      {hover && <PositionTooltip loc={hover.loc} itens={itens} x={hover.x} y={hover.y} />}
    </div>
  );
}
