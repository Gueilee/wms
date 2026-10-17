import type { Item, Lote } from "@/types";

// Gerador simplificado de conteúdo de etiqueta GS1-128 para fins de
// demonstração: Application Identifiers reais (01=GTIN, 10=Lote, 17=Validade,
// 37=Quantidade), sem checksum real de GTIN — suficiente para ilustrar o
// padrão ao cliente, não para uso em produção.
export function gerarGtinFicticio(codigoItem: string): string {
  const base = codigoItem.padStart(10, "0").slice(-10);
  return `789${base}0`;
}

export function gerarConteudoGs1(item: Item, quantidade: number, lote?: Lote): string {
  const partes = [`(01)${gerarGtinFicticio(item.codigo)}`];
  if (lote) {
    partes.push(`(10)${lote.numeroLote}`);
    if (lote.dataValidade) {
      const validade = lote.dataValidade.replace(/-/g, "").slice(2);
      partes.push(`(17)${validade}`);
    }
  }
  partes.push(`(37)${quantidade}`);
  return partes.join(" ");
}
