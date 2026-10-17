"use client";

import { useEffect, useState } from "react";

/** Timestamp "agora" que atualiza a cada `intervaloMs` — evita ler Date.now()
 * diretamente durante a renderização (efeito colateral impuro). */
export function useAgora(intervaloMs = 1000) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return agora;
}
