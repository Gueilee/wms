import type { Item, Localizacao, MovimentoEstoque } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";

export type ModoHeatmap = "abc" | "ocupacao" | "atividade";

export const JANELA_ATIVIDADE_MS = 60_000;

// Espaçamento da cena — cada rua vira uma "fileira" de estante ao longo de Z,
// cada posição um ponto ao longo de X, cada altura um nível ao longo de Y.
const PASSO_POSICAO = 1.05;
const PASSO_ALTURA = 1.4;
const PASSO_RUA = 3.2;

export function coordenadas3d(loc: Localizacao): [number, number, number] {
  const ruaIndex = RUAS_ORDEM.indexOf(loc.rua);
  const alturaIndex = Number(loc.altura);
  const posicaoIndex = Number(loc.posicao);
  const x = (posicaoIndex - 1) * PASSO_POSICAO;
  const y = alturaIndex * PASSO_ALTURA + PASSO_ALTURA / 2;
  const z = ruaIndex * PASSO_RUA;
  return [x, y, z];
}

const COR_ABC = { A: "#16a34a", B: "#2563eb", C: "#94a3b8" } as const;
const COR_OCUPACAO = { livre: "#cbd5e1", ocupado: "#b8905b", bloqueado: "#f59e0b" } as const;
const COR_BASE_ATIVIDADE = "#2b3440";
const COR_PICO_ATIVIDADE = "#ff5a3c";

export function corPorClasseAbc(loc: Localizacao, item?: Item): string {
  if (loc.status === "bloqueado") return COR_OCUPACAO.bloqueado;
  if (loc.status === "livre" || !item) return COR_OCUPACAO.livre;
  return COR_ABC[item.classeAbc];
}

export function corPorOcupacao(loc: Localizacao): string {
  return COR_OCUPACAO[loc.status];
}

/** Mapa localizacaoId -> timestamp (ms) do movimento mais recente ligado a ela. */
export function mapaUltimaAtividade(movimentos: MovimentoEstoque[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const mov of movimentos) {
    const ts = new Date(mov.timestamp).getTime();
    for (const locId of [mov.localizacaoOrigemId, mov.localizacaoDestinoId]) {
      if (!locId) continue;
      if (!mapa.has(locId)) mapa.set(locId, ts);
    }
  }
  return mapa;
}

/** 0 = sem atividade recente, 1 = atividade neste instante. */
export function intensidadeAtividade(localizacaoId: string, ultimaAtividade: Map<string, number>, agora: number): number {
  const ts = ultimaAtividade.get(localizacaoId);
  if (!ts) return 0;
  const decorrido = agora - ts;
  if (decorrido < 0 || decorrido > JANELA_ATIVIDADE_MS) return 0;
  return 1 - decorrido / JANELA_ATIVIDADE_MS;
}

export function corPorAtividade(intensidade: number): string {
  if (intensidade <= 0) return COR_BASE_ATIVIDADE;
  return misturarCores(COR_BASE_ATIVIDADE, COR_PICO_ATIVIDADE, intensidade);
}

function misturarCores(hexA: string, hexB: string, t: number): string {
  const a = hexParaRgb(hexA);
  const b = hexParaRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexParaRgb(hex: string) {
  const v = hex.replace("#", "");
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function corPorModo(modo: ModoHeatmap, loc: Localizacao, item: Item | undefined, intensidadeAtiv: number): string {
  if (modo === "abc") return corPorClasseAbc(loc, item);
  if (modo === "ocupacao") return corPorOcupacao(loc);
  return corPorAtividade(intensidadeAtiv);
}
