import type { Localizacao } from "@/types";
import { mulberry32, randInt } from "./rng";

// Réplica exata do layout físico real da Braspel, extraído de
// "Planejamento_Endereçamento_Estoque.xlsx": 9 ruas (A-I), endereço
// RUA.ALTURA.POSIÇÃO a partir de "00" (chão), com capacidade desigual por rua
// (reflexo de colunas/restrições físicas reais do galpão).
const RUAS_GRANDES = ["A", "B", "C", "G"] as const; // 3 alturas x 12 posições
const RUAS_MEDIAS = ["D", "E", "F"] as const; // altura 00 = 4, alturas 01/02 = 10
const RUAS_PEQUENAS = ["H", "I"] as const; // 3 alturas x 4 posições

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function buildLayout(): Localizacao[] {
  const rand = mulberry32(20261017);
  const locs: Localizacao[] = [];

  const push = (rua: string, altura: number, posicao: number) => {
    const codigo = `${rua}.${pad2(altura)}.${pad2(posicao)}`;
    locs.push({
      id: codigo,
      rua,
      altura: pad2(altura),
      posicao: pad2(posicao),
      codigo,
      capacidadeUnidades: randInt(rand, 180, 620),
      status: "livre",
    });
  };

  for (const rua of RUAS_GRANDES) {
    for (let altura = 0; altura <= 2; altura++) {
      for (let posicao = 1; posicao <= 12; posicao++) push(rua, altura, posicao);
    }
  }

  for (const rua of RUAS_MEDIAS) {
    for (let posicao = 1; posicao <= 4; posicao++) push(rua, 0, posicao);
    for (let posicao = 1; posicao <= 10; posicao++) push(rua, 1, posicao);
    for (let posicao = 1; posicao <= 10; posicao++) push(rua, 2, posicao);
  }

  for (const rua of RUAS_PEQUENAS) {
    for (let altura = 0; altura <= 2; altura++) {
      for (let posicao = 1; posicao <= 4; posicao++) push(rua, altura, posicao);
    }
  }

  return locs;
}

export const RUAS_ORDEM = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
