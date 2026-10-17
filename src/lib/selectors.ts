import type { ContagemInventario, Item, Localizacao, Lote, Pedido } from "@/types";
import { calcularAlertas } from "./alerts";

export function useAlertasAtivos(
  itens: Item[],
  lotes: Lote[],
  pedidos: Pedido[],
  contagens: ContagemInventario[],
  localizacoes: Localizacao[],
  ignorados: string[]
) {
  return calcularAlertas(itens, lotes, pedidos, contagens, localizacoes).filter((a) => !ignorados.includes(a.id));
}

export function calcularOcupacao(localizacoes: Localizacao[]) {
  const total = localizacoes.length;
  const ocupadas = localizacoes.filter((l) => l.status === "ocupado").length;
  const bloqueadas = localizacoes.filter((l) => l.status === "bloqueado").length;
  const livres = total - ocupadas - bloqueadas;
  return { total, ocupadas, bloqueadas, livres, percentual: total ? Math.round((ocupadas / total) * 100) : 0 };
}

export function calcularValorEstoque(itens: Item[]) {
  return itens
    .filter((i) => i.categoria !== "Ferramental")
    .reduce((acc, i) => acc + i.saldoDisponivel * i.valorUnitario, 0);
}

export function calcularDistribuicaoAbc(itens: Item[]) {
  const base = itens.filter((i) => i.categoria !== "Ferramental");
  const porClasse = { A: 0, B: 0, C: 0 };
  for (const item of base) porClasse[item.classeAbc] += item.saldoDisponivel * item.valorUnitario;
  const totalValor = porClasse.A + porClasse.B + porClasse.C || 1;
  return [
    { classe: "A" as const, valor: porClasse.A, percentual: (porClasse.A / totalValor) * 100, itens: base.filter((i) => i.classeAbc === "A").length },
    { classe: "B" as const, valor: porClasse.B, percentual: (porClasse.B / totalValor) * 100, itens: base.filter((i) => i.classeAbc === "B").length },
    { classe: "C" as const, valor: porClasse.C, percentual: (porClasse.C / totalValor) * 100, itens: base.filter((i) => i.classeAbc === "C").length },
  ];
}

export function itensAbaixoDoMinimo(itens: Item[]) {
  return itens.filter((i) => i.categoria !== "Ferramental" && i.saldoDisponivel <= i.estoqueMinimo);
}

export function calcularAcuraciaInventario(contagens: ContagemInventario[]) {
  const concluidas = contagens.filter((c) => c.status !== "pendente");
  if (concluidas.length === 0) return null;
  const corretas = concluidas.filter((c) => c.status === "conferida").length;
  return Math.round((corretas / concluidas.length) * 100);
}
