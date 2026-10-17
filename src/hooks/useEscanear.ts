"use client";

import { useCallback, useState } from "react";

function tocarBipe() {
  try {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1500;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Ambiente sem suporte a Web Audio — só o efeito visual permanece.
  }
}

/** Simula o feedback de leitura de um coletor real: laser visual + bipe + vibração curta. */
export function useEscanear() {
  const [escaneando, setEscaneando] = useState(false);

  const disparar = useCallback((aoConcluir: () => void) => {
    setEscaneando(true);
    tocarBipe();
    navigator.vibrate?.(60);
    window.setTimeout(() => {
      setEscaneando(false);
      aoConcluir();
    }, 420);
  }, []);

  return { escaneando, disparar };
}
