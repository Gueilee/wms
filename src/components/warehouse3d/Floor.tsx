"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Textura procedural (grade + faixa de borda) gerada via Canvas 2D,
// convertida em CanvasTexture. Paleta escura/premium para combinar com o
// novo fundo em gradiente (em vez do cinza claro de galpão genérico).
function criarTexturaPiso() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#232a27";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "#2f3833";
  ctx.lineWidth = 2;
  const passo = 32;
  for (let i = 0; i <= 512; i += passo) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  ctx.strokeStyle = "#b8905b";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 504);
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  return textura;
}

export function Floor({ largura, profundidade }: { largura: number; profundidade: number }) {
  const textura = useMemo(() => {
    const t = criarTexturaPiso();
    t.repeat.set(largura / 4, profundidade / 4);
    return t;
  }, [largura, profundidade]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[largura / 2 - 1, -0.01, profundidade / 2 - 2]} receiveShadow>
      <planeGeometry args={[largura + 20, profundidade + 26]} />
      <meshStandardMaterial map={textura} roughness={0.75} metalness={0.15} />
    </mesh>
  );
}
