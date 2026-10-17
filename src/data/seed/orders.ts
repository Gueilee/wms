import type { Item, ItemPedido, Pedido, StatusPedido } from "@/types";
import { CLIENTES } from "./clients";
import { mulberry32, pick, randInt } from "./rng";

function addDias(base: Date, dias: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const TRANSPORTADORAS = ["Transul Logística", "Rápido Vale Express", "Frota própria Braspel"];

export function construirPedidos(itens: Item[]): Pedido[] {
  const rand = mulberry32(55102);
  const hoje = new Date();
  const statusSequencia: StatusPedido[] = [
    "aberto",
    "aberto",
    "aberto",
    "separando",
    "separando",
    "separado",
    "separado",
    "embalado",
    "embalado",
    "expedido",
  ];

  return statusSequencia.map((status, idx) => {
    const cliente = CLIENTES[idx % CLIENTES.length];
    const personalizadosCliente = itens.filter(
      (i) => i.modeloArte === "personalizado" && i.clienteId === cliente.id
    );
    const padroes = itens.filter((i) => i.modeloArte !== "personalizado" && i.categoria !== "Ferramental");

    const candidatos = [
      ...personalizadosCliente.slice(0, 2),
      pick(rand, padroes),
      pick(rand, padroes),
    ].filter(
      (item, i, arr) => item && arr.findIndex((x) => x.id === item.id) === i
    );

    const itensPedido: ItemPedido[] = candidatos.slice(0, 3).map((item) => {
      const quantidade = randInt(rand, 2, Math.max(3, Math.min(20, Math.round(item.saldoDisponivel * 0.25))));
      const separado = status === "aberto" || status === "separando" ? 0 : quantidade;
      return { itemId: item.id, quantidade, quantidadeSeparada: status === "separando" ? Math.round(quantidade / 2) : separado };
    });

    return {
      id: `pedido-${idx + 1}`,
      numero: `PED-${2026000 + idx + 1}`,
      clienteId: cliente.id,
      status,
      itens: itensPedido,
      dataCriacao: addDias(hoje, -randInt(rand, 1, 6)),
      dataPrevista: addDias(hoje, randInt(rand, -1, 5)),
      transportadora: status === "embalado" || status === "expedido" ? pick(rand, TRANSPORTADORAS) : undefined,
    } satisfies Pedido;
  });
}
