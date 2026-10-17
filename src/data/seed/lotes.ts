import type { Item, Lote } from "@/types";
import { mulberry32, randInt } from "./rng";

function addDias(base: Date, dias: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Gera lotes com data de fabricação/validade para matéria-prima rastreável
// (bobinas e papel acoplado). Dois lotes são propositalmente colocados perto
// do vencimento para alimentar o alerta de "validade próxima" na demo.
export function construirLotes(itens: Item[]): Lote[] {
  const rand = mulberry32(77321);
  const rastreaveis = itens.filter((i) => i.loteValidadeControlado);
  const lotes: Lote[] = [];
  const hoje = new Date();

  rastreaveis.forEach((item, idx) => {
    const quantidadeLotes = item.saldoDisponivel > 20 ? 2 : 1;
    let restante = item.saldoDisponivel;
    for (let l = 0; l < quantidadeLotes; l++) {
      const qtd = l === quantidadeLotes - 1 ? restante : Math.round(restante / 2);
      restante -= qtd;
      const diasFabricacao = randInt(rand, -180, -10);
      const validadeMeses = randInt(rand, 6, 18);
      const forcarProximoVencimento = idx < 2 && l === 0;
      const dataFabricacao = addDias(hoje, diasFabricacao);
      const dataValidade = forcarProximoVencimento
        ? addDias(hoje, randInt(rand, 5, 25))
        : addDias(hoje, diasFabricacao + validadeMeses * 30);

      lotes.push({
        id: `lote-${item.id}-${l}`,
        itemId: item.id,
        numeroLote: `L${hoje.getFullYear()}${String(idx + 1).padStart(3, "0")}${l}`,
        dataFabricacao,
        dataValidade,
        quantidade: qtd,
        localizacaoId: item.localizacaoPrincipalId,
      });
    }
  });

  return lotes;
}
