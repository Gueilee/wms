"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Textura procedural (grade + faixas) gerada via Canvas 2D, convertida em
// CanvasTexture — o mesmo truque descrito na referência, só que para o piso
// epóxi em vez das placas de rua (essas usam texto via drei/Text).
function criarTexturaPiso() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#cfd4da";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "#b7bec7";
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
  ctx.strokeStyle = "#f2b705";
  ctx.lineWidth = 4;
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
      <planeGeometry args={[largura + 4, profundidade + 6]} />
      <meshStandardMaterial map={textura} roughness={0.9} />
    </mesh>
  );
}
