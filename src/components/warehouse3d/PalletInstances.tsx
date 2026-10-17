"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Item, Localizacao } from "@/types";
import { coordenadas3d, corPorModo, intensidadeAtividade, mapaUltimaAtividade, type ModoHeatmap } from "@/lib/heatmap";

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
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const itemPorId = useMemo(() => new Map(itens.map((i) => [i.id, i])), [itens]);

  // Posiciona cada instância uma única vez — a topologia real do armazém não muda em runtime.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    localizacoes.forEach((loc, i) => {
      const [x, y, z] = coordenadas3d(loc);
      matrix.makeTranslation(x, y, z);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [localizacoes]);

  // Recolore a cada frame conforme o modo de heatmap ativo (a atividade recente decai com o tempo).
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const agora = Date.now();
    const cor = new THREE.Color();
    localizacoes.forEach((loc, i) => {
      const item = loc.itemId ? itemPorId.get(loc.itemId) : undefined;
      const intensidade = intensidadeAtividade(loc.id, ultimaAtividade, agora);
      const hex = corPorModo(modo, loc, item, intensidade);
      cor.set(hex);
      if (loc.id === selecionadaId) cor.lerp(new THREE.Color("#ffffff"), 0.35);
      mesh.setColorAt(i, cor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (materialRef.current) materialRef.current.opacity = opacidade;
  });

  function aoMover(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const loc = localizacoes[e.instanceId];
    onHover(loc, { x: e.clientX, y: e.clientY });
    document.body.style.cursor = "pointer";
  }

  function aoSair() {
    onHover(null);
    document.body.style.cursor = "auto";
  }

  function aoClicar(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    onSelecionar(localizacoes[e.instanceId]);
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, localizacoes.length]}
      castShadow
      receiveShadow
      onPointerMove={aoMover}
      onPointerOut={aoSair}
      onClick={aoClicar}
    >
      <boxGeometry args={PALLET_SIZE} />
      <meshStandardMaterial ref={materialRef} roughness={0.6} metalness={0.05} transparent />
    </instancedMesh>
  );
}
