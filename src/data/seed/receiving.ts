import type { Item, RecebimentoPendente } from "@/types";
import { mulberry32, randInt } from "./rng";

function addDias(base: Date, dias: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function construirRecebimentosPendentes(itens: Item[]): RecebimentoPendente[] {
  const rand = mulberry32(42042);
  const bobinas = itens.filter((i) => i.categoria === "Bobina");
  const liso = itens.filter((i) => i.modeloArte === "liso" && i.categoria !== "Bobina" && i.categoria !== "Ferramental");
  const hoje = new Date();

  return [
    {
      id: "receb-1",
      numero: "REC-4471",
      fornecedorOuProducao: "Papelaria Vale do Paraíba (matéria-prima)",
      itens: bobinas.slice(0, 3).map((i) => ({ itemId: i.id, quantidadeEsperada: randInt(rand, 6, 16) })),
      dataPrevista: addDias(hoje, 0),
    },
    {
      id: "receb-2",
      numero: "REC-4472",
      fornecedorOuProducao: "Produção interna — linha de impressão 2",
      itens: liso.slice(0, 4).map((i) => ({ itemId: i.id, quantidadeEsperada: randInt(rand, 40, 120) })),
      dataPrevista: addDias(hoje, 0),
    },
  ];
}
