"use client";

import Image from "next/image";
import type { ReactNode } from "react";

// Recorte da área de tela dentro da foto real do coletor (coletor.webp,
// 241x321px) — calibrado visualmente. Se precisar reajustar após ver a
// apresentação renderizada, mexa só nestes quatro números (percentuais da
// imagem inteira, não do aparelho).
const TELA = {
  top: 10.5,
  left: 21,
  right: 21,
  bottom: 50.5,
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
