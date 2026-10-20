"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Instance, Instances } from "@react-three/drei";
import type { Localizacao } from "@/types";
import { coordenadas3d, corPorMovimentacao } from "@/lib/heatmap";

// Textura de uma mancha suave (branco opaco no centro, totalmente
// transparente na borda) — a mesma técnica de mapas de calor geográficos
// (ex.: o heatmap de entregas por região). Cada posição pinta sua própria
// mancha nessa cor/intensidade; com blending aditivo, manchas vizinhas se
// fundem e se somam, criando o efeito de "borrão contínuo" em vez de blocos
// sólidos com borda dura.
function criarTexturaMancha() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function FloorHeatmap({ localizacoes, opacidade }: { localizacoes: Localizacao[]; opacidade: number }) {
  const textura = useMemo(() => criarTexturaMancha(), []);
  const pontos = useMemo(() => localizacoes.filter((l) => (l.indiceMovimentacao ?? 0) > 0.03), [localizacoes]);

  return (
    <Instances limit={Math.max(pontos.length, 1)} range={pontos.length}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial map={textura} transparent opacity={opacidade} depthWrite={false} blending={THREE.AdditiveBlending} />
      {pontos.map((loc) => {
        const [x, , z] = coordenadas3d(loc);
        const indice = loc.indiceMovimentacao ?? 0;
        return (
          <Instance
            key={loc.id}
            position={[x, 0.02, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.55 + indice * 0.95}
            color={new THREE.Color(corPorMovimentacao(indice))}
          />
        );
      })}
    </Instances>
  );
}
