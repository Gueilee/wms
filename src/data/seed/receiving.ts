import type { Item, NotaFiscal, RecebimentoPendente } from "@/types";
import { mulberry32, randInt } from "./rng";
import { construirNotaFiscalEntrada } from "@/lib/fiscal";

function addDias(base: Date, dias: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function construirRecebimentosPendentes(itens: Item[]): {
  recebimentos: RecebimentoPendente[];
  notasFiscais: NotaFiscal[];
} {
  const rand = mulberry32(42042);
  const bobinas = itens.filter((i) => i.categoria === "Bobina");
  const liso = itens.filter((i) => i.modeloArte === "liso" && i.categoria !== "Bobina" && i.categoria !== "Ferramental");
  const hoje = new Date();

  // REC-1: matéria-prima de fornecedor externo — tem NF-e de entrada de verdade.
  const itensBobina = bobinas.slice(0, 3).map((item) => ({ item, quantidade: randInt(rand, 6, 16) }));
  const notaEntrada = construirNotaFiscalEntrada(itensBobina, {
    razaoSocial: "Papelaria Vale do Paraíba Ltda",
    cnpj: "12.345.678/0001-90",
    uf: "35",
  });

  const recebimentos: RecebimentoPendente[] = [
    {
      id: "receb-1",
      numero: "REC-4471",
      fornecedorOuProducao: "Papelaria Vale do Paraíba (matéria-prima)",
      itens: itensBobina.map(({ item, quantidade }) => ({ itemId: item.id, quantidadeEsperada: quantidade })),
      dataPrevista: addDias(hoje, 0),
      notaFiscalId: notaEntrada.id,
    },
    {
      // REC-2: transferência de produção interna — sem NF-e (não é entrada fiscal).
      id: "receb-2",
      numero: "REC-4472",
      fornecedorOuProducao: "Produção interna — linha de impressão 2",
      itens: liso.slice(0, 4).map((i) => ({ itemId: i.id, quantidadeEsperada: randInt(rand, 40, 120) })),
      dataPrevista: addDias(hoje, 0),
    },
  ];

  return { recebimentos, notasFiscais: [notaEntrada] };
}
