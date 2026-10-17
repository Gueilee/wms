import type { Alerta, ContagemInventario, Item, Localizacao, Lote, Pedido } from "@/types";
import { diasAte } from "./format";

export function calcularAlertas(
  itens: Item[],
  lotes: Lote[],
  pedidos: Pedido[],
  contagens: ContagemInventario[],
  localizacoes: Localizacao[]
): Alerta[] {
  const alertas: Alerta[] = [];
  const hoje = new Date().toISOString();

  for (const item of itens) {
    if (item.categoria === "Ferramental") continue;
    if (item.saldoDisponivel <= item.estoqueMinimo) {
      alertas.push({
        id: `alerta-estoque-${item.id}`,
        tipo: "estoque_baixo",
        severidade: item.saldoDisponivel === 0 ? "critico" : "atencao",
        mensagem: `${item.nome} está ${item.saldoDisponivel === 0 ? "zerado" : "abaixo do estoque mínimo"} (${item.saldoDisponivel}/${item.estoqueMinimo} ${item.unidadeMedida}).`,
        itemId: item.id,
        timestamp: hoje,
        resolvido: false,
      });
    }
  }

  for (const lote of lotes) {
    if (!lote.dataValidade) continue;
    const dias = diasAte(lote.dataValidade);
    if (dias <= 30) {
      const item = itens.find((i) => i.id === lote.itemId);
      alertas.push({
        id: `alerta-validade-${lote.id}`,
        tipo: "validade_proxima",
        severidade: dias <= 10 ? "critico" : "atencao",
        mensagem: `Lote ${lote.numeroLote} de ${item?.nome ?? lote.itemId} vence em ${dias} dia(s).`,
        itemId: lote.itemId,
        timestamp: hoje,
        resolvido: false,
      });
    }
  }

  for (const pedido of pedidos) {
    if (pedido.status === "expedido") continue;
    const dias = diasAte(pedido.dataPrevista);
    if (dias < 0) {
      alertas.push({
        id: `alerta-pedido-${pedido.id}`,
        tipo: "pedido_atrasado",
        severidade: "critico",
        mensagem: `Pedido ${pedido.numero} está atrasado (previsto para ${pedido.dataPrevista}).`,
        timestamp: hoje,
        resolvido: false,
      });
    }
  }

  for (const contagem of contagens) {
    if (contagem.status === "divergente") {
      const item = itens.find((i) => i.id === contagem.itemId);
      alertas.push({
        id: `alerta-contagem-${contagem.id}`,
        tipo: "divergencia_inventario",
        severidade: "atencao",
        mensagem: `Divergência de inventário em ${item?.nome ?? contagem.itemId}: sistema ${contagem.saldoSistema}, contado ${contagem.saldoContado}.`,
        itemId: contagem.itemId,
        timestamp: hoje,
        resolvido: false,
      });
    }
  }

  for (const loc of localizacoes) {
    if (loc.status === "bloqueado") {
      alertas.push({
        id: `alerta-local-${loc.id}`,
        tipo: "posicao_bloqueada",
        severidade: "info",
        mensagem: `Posição ${loc.codigo} está bloqueada — ${loc.motivoBloqueio}.`,
        timestamp: hoje,
        resolvido: false,
      });
    }
  }

  return alertas;
}
