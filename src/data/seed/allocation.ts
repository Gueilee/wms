import type { Item, Localizacao } from "@/types";
import { RUAS_ORDEM } from "./layout";

// Aloca itens às posições físicas aplicando a mesma lógica que o sistema usa
// no dia a dia: classe A (alto giro) nas posições mais acessíveis (altura do
// chão, ruas da frente), classe C/personalizados nas posições mais distantes.
// Deliberadamente deixa ~40-45% das posições livres para demonstrar sugestão
// de putaway durante o recebimento.
export function alocarItens(itens: Item[], locais: Localizacao[]) {
  const alocaveis = itens.filter((i) => i.categoria !== "Ferramental");

  const ranqueadas = [...locais].sort((a, b) => {
    const ordemRua = RUAS_ORDEM.indexOf(a.rua) - RUAS_ORDEM.indexOf(b.rua);
    if (ordemRua !== 0) return ordemRua;
    const alturaDiff = Number(a.altura) - Number(b.altura);
    if (alturaDiff !== 0) return alturaDiff;
    return Number(a.posicao) - Number(b.posicao);
  });

  const porClasse = {
    A: alocaveis.filter((i) => i.classeAbc === "A"),
    B: alocaveis.filter((i) => i.classeAbc === "B"),
    C: alocaveis.filter((i) => i.classeAbc === "C"),
  };

  let cursorFrente = 0;
  let cursorFundo = ranqueadas.length - 1;
  const usados = new Set<string>();

  const ocupar = (loc: Localizacao, item: Item) => {
    loc.status = "ocupado";
    loc.itemId = item.id;
    loc.quantidadeArmazenada = Math.min(item.saldoDisponivel, loc.capacidadeUnidades);
    item.localizacaoPrincipalId = loc.id;
    usados.add(loc.id);
  };

  for (const item of porClasse.A) {
    while (usados.has(ranqueadas[cursorFrente]?.id)) cursorFrente++;
    const loc = ranqueadas[cursorFrente];
    if (!loc) break;
    ocupar(loc, item);
    cursorFrente++;
    // Itens classe A ganham uma segunda posição de pulmão (reabastecimento).
    while (usados.has(ranqueadas[cursorFrente]?.id)) cursorFrente++;
    const segunda = ranqueadas[cursorFrente];
    if (segunda && cursorFrente < cursorFundo) {
      segunda.status = "ocupado";
      segunda.itemId = item.id;
      segunda.quantidadeArmazenada = Math.round(item.saldoDisponivel * 0.3);
      usados.add(segunda.id);
      cursorFrente++;
    }
  }

  for (const item of porClasse.B) {
    while (usados.has(ranqueadas[cursorFrente]?.id)) cursorFrente++;
    const loc = ranqueadas[cursorFrente];
    if (!loc || cursorFrente >= cursorFundo) break;
    ocupar(loc, item);
    cursorFrente++;
  }

  for (const item of porClasse.C) {
    while (usados.has(ranqueadas[cursorFundo]?.id)) cursorFundo--;
    const loc = ranqueadas[cursorFundo];
    if (!loc || cursorFundo <= cursorFrente) break;
    ocupar(loc, item);
    cursorFundo--;
  }

  // Bloqueia um pequeno número de posições para simular quarentena/avaria.
  const livres = ranqueadas.filter((l) => !usados.has(l.id));
  for (let i = 0; i < Math.min(3, livres.length); i++) {
    livres[i].status = "bloqueado";
    livres[i].motivoBloqueio = i === 0 ? "Quarentena — aguardando inspeção de qualidade" : "Avaria na estrutura";
  }
}
