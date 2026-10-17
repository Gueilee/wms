"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Localizacao } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { coordenadas3d, corPorMovimentacao } from "@/lib/heatmap";

// Um retângulo translúcido por rua, pintado pela média do índice de
// movimentação dos seus ocupantes — a visão "onde o chão mais pisou" que
// orienta a decisão de slotting (Curva A na frente, C no fundo).
export function FloorHeatmap({ localizacoes }: { localizacoes: Localizacao[] }) {
  const ruas = useMemo(() => {
    return RUAS_ORDEM.map((rua) => {
      const daRua = localizacoes.filter((l) => l.rua === rua);
      if (daRua.length === 0) return null;
      const ocupadas = daRua.filter((l) => l.indiceMovimentacao !== undefined);
      const media = ocupadas.length
        ? ocupadas.reduce((acc, l) => acc + (l.indiceMovimentacao ?? 0), 0) / ocupadas.length
        : 0;
      const maxPosicao = Math.max(...daRua.map((l) => Number(l.posicao)));
      const [, , z] = coordenadas3d(daRua[0]);
      const comprimento = (maxPosicao - 1) * 1.05 + 1.4;
      return { rua, z, comprimento, media };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [localizacoes]);

  return (
    <group>
      {ruas.map(({ rua, z, comprimento, media }) => (
        <mesh key={rua} rotation={[-Math.PI / 2, 0, 0]} position={[comprimento / 2 - 0.3, 0.01, z]}>
          <planeGeometry args={[comprimento + 1, 2.4]} />
          <meshBasicMaterial color={new THREE.Color(corPorMovimentacao(media))} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}
