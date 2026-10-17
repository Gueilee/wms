import type { ContagemInventario, Item, Localizacao, Lote, MovimentoEstoque, NotaFiscal, Pedido, RecebimentoPendente, Cliche, Cliente } from "@/types";
import { CLIENTES } from "./clients";
import { CLICHES, ITENS } from "./catalog";
import { buildLayout } from "./layout";
import { alocarItens } from "./allocation";
import { construirLotes } from "./lotes";
import { construirPedidos } from "./orders";
import { construirRecebimentosPendentes } from "./receiving";

export interface EstadoWms {
  itens: Item[];
  localizacoes: Localizacao[];
  lotes: Lote[];
  pedidos: Pedido[];
  clientes: Cliente[];
  cliches: Cliche[];
  recebimentosPendentes: RecebimentoPendente[];
  notasFiscais: NotaFiscal[];
  contagens: ContagemInventario[];
  movimentos: MovimentoEstoque[];
}

export function criarEstadoInicial(): EstadoWms {
  // Clona profundamente o catálogo seed a cada reset, para que mutações da
  // sessão anterior (saldo, localização ocupada) nunca vazem para a próxima.
  const itens: Item[] = ITENS.map((i) => ({ ...i }));
  const localizacoes: Localizacao[] = buildLayout();

  alocarItens(itens, localizacoes);

  const lotes = construirLotes(itens);
  const pedidos = construirPedidos(itens);
  const { recebimentos: recebimentosPendentes, notasFiscais } = construirRecebimentosPendentes(itens);

  return {
    itens,
    localizacoes,
    lotes,
    pedidos,
    clientes: CLIENTES,
    cliches: CLICHES,
    recebimentosPendentes,
    notasFiscais,
    contagens: [],
    movimentos: [],
  };
}
