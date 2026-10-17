"use client";

import Image from "next/image";
import type { ReactNode } from "react";

// Recorte da área de tela dentro da foto real do coletor (coletor.webp,
// 241x321px) — calibrado por análise de pixel da imagem original (não
// visualmente): a tela ocupa x=[77.5,160] e y=[39,176.5] nos 241x321px.
// Se precisar reajustar, mexa só nestes quatro números (percentuais da
// imagem inteira, não do aparelho).
const TELA = {
  top: 12,
  left: 32,
  right: 33.5,
  bottom: 45,
};

export function ColetorFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-full" style={{ aspectRatio: "241 / 321" }}>
      <Image src="/coletor.webp" alt="Coletor de dados" fill priority className="object-contain select-none pointer-events-none" />
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          top: `${TELA.top}%`,
          left: `${TELA.left}%`,
          right: `${TELA.right}%`,
          bottom: `${TELA.bottom}%`,
          borderRadius: "6%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
