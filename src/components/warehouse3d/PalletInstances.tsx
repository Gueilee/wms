"use client";

import { useMemo } from "react";
import { Instance, Instances } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Item, Localizacao } from "@/types";
import { coordenadas3d, corPorModo, intensidadeAtividade, mapaUltimaAtividade, type ModoHeatmap } from "@/lib/heatmap";
import { useAgora } from "@/hooks/useAgora";

interface PalletInstancesProps {
  localizacoes: Localizacao[];
  itens: Item[];
  modo: ModoHeatmap;
  opacidade: number;
  ultimaAtividade: ReturnType<typeof mapaUltimaAtividade>;
  selecionadaId?: string;
  onSelecionar: (loc: Localizacao) => void;
  onHover: (loc: Localizacao | null, posicaoTela?: { x: number; y: number }) => void;
}

const PALLET_SIZE: [number, number, number] = [0.85, 1.05, 0.85];

function definirCursor(valor: string) {
  document.body.style.cursor = valor;
}

// Usa <Instances>/<Instance> do drei em vez de <instancedMesh> bruto: cada
// posição vira um elemento React de verdade, com seu próprio onClick —
// elimina a classe de bug de raycasting manual via e.instanceId que afeta
// InstancedMesh puro em alguns cenários (instâncias que não respondiam a clique).
export function PalletInstances({
  localizacoes,
  itens,
  modo,
  opacidade,
  ultimaAtividade,
  selecionadaId,
  onSelecionar,
  onHover,
}: PalletInstancesProps) {
  const itemPorId = useMemo(() => new Map(itens.map((i) => [i.id, i])), [itens]);
  // A decaída da "atividade ao vivo" não precisa de 60fps — recalcular a cada
  // ~800ms já dá o efeito de pulso visual, sem mutação imperativa de buffer.
  const agora = useAgora(800);

  function aoMover(e: ThreeEvent<PointerEvent>, loc: Localizacao) {
    e.stopPropagation();
    onHover(loc, { x: e.clientX, y: e.clientY });
    definirCursor("pointer");
  }

  function aoSair() {
    onHover(null);
    definirCursor("auto");
  }

  function aoClicar(e: ThreeEvent<MouseEvent>, loc: Localizacao) {
    e.stopPropagation();
    onSelecionar(loc);
  }

  return (
    <Instances limit={localizacoes.length} range={localizacoes.length}>
      <boxGeometry args={PALLET_SIZE} />
      <meshStandardMaterial roughness={0.6} metalness={0.05} transparent opacity={opacidade} />
      {localizacoes.map((loc) => {
        const item = loc.itemId ? itemPorId.get(loc.itemId) : undefined;
        const intensidade = intensidadeAtividade(loc.id, ultimaAtividade, agora);
        const cor = new THREE.Color(corPorModo(modo, loc, item, intensidade));
        if (loc.id === selecionadaId) cor.lerp(new THREE.Color("#ffffff"), 0.4);

        return (
          <Instance
            key={loc.id}
            position={coordenadas3d(loc)}
            color={cor}
            castShadow
            receiveShadow
            onPointerMove={(e: ThreeEvent<PointerEvent>) => aoMover(e, loc)}
            onPointerOut={aoSair}
            onClick={(e: ThreeEvent<MouseEvent>) => aoClicar(e, loc)}
          />
        );
      })}
    </Instances>
  );
}
