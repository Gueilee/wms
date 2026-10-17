"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ClasseAbc,
  ContagemInventario,
  Item,
  Localizacao,
  MensagemCopiloto,
  Pedido,
  PerfilUsuario,
  RecebimentoPendente,
  StatusPedido,
} from "@/types";
import { criarEstadoInicial, type EstadoWms } from "@/data/seed";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { CLIENTES } from "@/data/seed/clients";
import { gerarNotaFiscalEntrada, gerarNotaFiscalSaida } from "@/lib/fiscal";

interface WmsStore extends EstadoWms {
  perfil: PerfilUsuario;
  alertasIgnorados: string[];
  mensagensCopiloto: MensagemCopiloto[];

  definirPerfil: (perfil: PerfilUsuario) => void;
  resetDemo: () => void;
  ignorarAlerta: (id: string) => void;

  sugerirEndereco: (itemId: string) => Localizacao | undefined;
  confirmarPutaway: (recebimentoId: string, itemId: string, quantidade: number, localizacaoId: string) => void;
  simularChegadaNfe: () => void;

  iniciarSeparacao: (pedidoId: string) => void;
  confirmarPick: (pedidoId: string, itemId: string, quantidade: number) => void;
  embalarPedido: (pedidoId: string) => void;
  expedirPedido: (pedidoId: string, transportadora: string) => void;
  simularNovoPedido: () => void;

  gerarContagem: (classe?: ClasseAbc, quantidade?: number) => void;
  registrarContagem: (contagemId: string, saldoContado: number) => void;
  ajustarSaldoContagem: (contagemId: string) => void;

  adicionarMensagemCopiloto: (mensagem: MensagemCopiloto) => void;
}

function logMovimento(
  movimentos: EstadoWms["movimentos"],
  tipo: EstadoWms["movimentos"][number]["tipo"],
  itemId: string,
  quantidade: number,
  extra: Partial<EstadoWms["movimentos"][number]> = {}
) {
  movimentos.unshift({
    id: `mov-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    tipo,
    itemId,
    quantidade,
    timestamp: new Date().toISOString(),
    usuario: "Demonstração",
    ...extra,
  });
}

export const useWmsStore = create<WmsStore>()(
  persist(
    (set, get) => ({
      ...criarEstadoInicial(),
      perfil: "gestor",
      alertasIgnorados: [],
      mensagensCopiloto: [],

      definirPerfil: (perfil) => set({ perfil }),

      resetDemo: () =>
        set({
          ...criarEstadoInicial(),
          alertasIgnorados: [],
          mensagensCopiloto: [],
        }),

      ignorarAlerta: (id) => set((s) => ({ alertasIgnorados: [...s.alertasIgnorados, id] })),

      sugerirEndereco: (itemId) => {
        const { itens, localizacoes } = get();
        const item = itens.find((i) => i.id === itemId);
        if (!item) return undefined;

        const atual = localizacoes.find((l) => l.id === item.localizacaoPrincipalId);
        if (atual && (atual.quantidadeArmazenada ?? 0) < atual.capacidadeUnidades) {
          return atual;
        }

        const livres = localizacoes.filter((l) => l.status === "livre");
        if (livres.length === 0) return undefined;

        const prioridade = item.classeAbc === "A" ? 1 : item.classeAbc === "B" ? 2 : 3;
        const ranqueadas = [...livres].sort((a, b) => {
          const alturaDiff = Number(a.altura) - Number(b.altura);
          const scoreA = alturaDiff;
          const ordemRua = RUAS_ORDEM.indexOf(a.rua) - RUAS_ORDEM.indexOf(b.rua);
          if (prioridade === 1) return alturaDiff !== 0 ? alturaDiff : ordemRua;
          return -(alturaDiff !== 0 ? scoreA : ordemRua);
        });
        return ranqueadas[0];
      },

      confirmarPutaway: (recebimentoId, itemId, quantidade, localizacaoId) =>
        set((s) => {
          const itens = s.itens.map((i) =>
            i.id === itemId ? { ...i, saldoDisponivel: i.saldoDisponivel + quantidade, localizacaoPrincipalId: i.localizacaoPrincipalId ?? localizacaoId } : i
          );
          const agoraIso = new Date().toISOString();
          const localizacoes = s.localizacoes.map((l) =>
            l.id === localizacaoId
              ? {
                  ...l,
                  status: "ocupado" as const,
                  itemId,
                  quantidadeArmazenada: (l.quantidadeArmazenada ?? 0) + quantidade,
                  dataEntradaAtual: l.dataEntradaAtual ?? agoraIso,
                  ultimaMovimentacaoEm: agoraIso,
                  indiceMovimentacao: Math.min(1, (l.indiceMovimentacao ?? 0) + 0.08),
                }
              : l
          );
          const recebimentosPendentes = s.recebimentosPendentes
            .map((r) =>
              r.id === recebimentoId
                ? { ...r, itens: r.itens.filter((it) => it.itemId !== itemId) }
                : r
            )
            .filter((r) => r.itens.length > 0);

          const movimentos = [...s.movimentos];
          logMovimento(movimentos, "recebimento", itemId, quantidade, { referencia: recebimentoId });
          logMovimento(movimentos, "putaway", itemId, quantidade, { localizacaoDestinoId: localizacaoId, referencia: recebimentoId });

          return { itens, localizacoes, recebimentosPendentes, movimentos };
        }),

      simularChegadaNfe: () =>
        set((s) => {
          const candidatos = s.itens.filter((i) => i.categoria !== "Ferramental" && i.modeloArte !== "personalizado");
          const { nota, itensEscolhidos } = gerarNotaFiscalEntrada(candidatos);
          const recebimento: RecebimentoPendente = {
            id: `receb-${Date.now()}`,
            numero: `REC-${4470 + Math.floor(Math.random() * 900)}`,
            fornecedorOuProducao: nota.nomeEmitente,
            itens: itensEscolhidos.map(({ item, quantidade }) => ({ itemId: item.id, quantidadeEsperada: quantidade })),
            dataPrevista: new Date().toISOString().slice(0, 10),
            notaFiscalId: nota.id,
          };
          return {
            notasFiscais: [nota, ...s.notasFiscais],
            recebimentosPendentes: [recebimento, ...s.recebimentosPendentes],
          };
        }),

      iniciarSeparacao: (pedidoId) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: "separando" as StatusPedido } : p)),
        })),

      confirmarPick: (pedidoId, itemId, quantidade) =>
        set((s) => {
          const pedidos = s.pedidos.map((p) => {
            if (p.id !== pedidoId) return p;
            const itensPedido = p.itens.map((it) =>
              it.itemId === itemId
                ? { ...it, quantidadeSeparada: Math.min(it.quantidade, it.quantidadeSeparada + quantidade) }
                : it
            );
            const completo = itensPedido.every((it) => it.quantidadeSeparada >= it.quantidade);
            return { ...p, itens: itensPedido, status: completo ? ("separado" as StatusPedido) : p.status };
          });

          const itemAtual = s.itens.find((i) => i.id === itemId);
          const localizacaoOrigemId = itemAtual?.localizacaoPrincipalId;

          const itens = s.itens.map((i) =>
            i.id === itemId ? { ...i, saldoDisponivel: Math.max(0, i.saldoDisponivel - quantidade) } : i
          );

          const agoraIsoPick = new Date().toISOString();
          const localizacoes = s.localizacoes.map((l) =>
            l.itemId === itemId
              ? {
                  ...l,
                  quantidadeArmazenada: Math.max(0, (l.quantidadeArmazenada ?? 0) - quantidade),
                  ultimaMovimentacaoEm: agoraIsoPick,
                  indiceMovimentacao: Math.min(1, (l.indiceMovimentacao ?? 0) + 0.08),
                }
              : l
          );

          const movimentos = [...s.movimentos];
          logMovimento(movimentos, "picking", itemId, quantidade, { referencia: pedidoId, localizacaoOrigemId });

          return { pedidos, itens, localizacoes, movimentos };
        }),

      embalarPedido: (pedidoId) =>
        set((s) => {
          const movimentos = [...s.movimentos];
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          pedido?.itens.forEach((it) => logMovimento(movimentos, "packing", it.itemId, it.quantidade, { referencia: pedidoId }));
          return {
            pedidos: s.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: "embalado" as StatusPedido } : p)),
            movimentos,
          };
        }),

      expedirPedido: (pedidoId, transportadora) =>
        set((s) => {
          const movimentos = [...s.movimentos];
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          pedido?.itens.forEach((it) => logMovimento(movimentos, "expedicao", it.itemId, it.quantidade, { referencia: pedidoId }));

          let notasFiscais = s.notasFiscais;
          let notaFiscalSaidaId: string | undefined;
          const cliente = pedido ? s.clientes.find((c) => c.id === pedido.clienteId) : undefined;
          if (pedido && cliente) {
            const nota = gerarNotaFiscalSaida(pedido, s.itens, cliente);
            notasFiscais = [nota, ...s.notasFiscais];
            notaFiscalSaidaId = nota.id;
          }

          return {
            pedidos: s.pedidos.map((p) =>
              p.id === pedidoId ? { ...p, status: "expedido" as StatusPedido, transportadora, notaFiscalSaidaId } : p
            ),
            movimentos,
            notasFiscais,
          };
        }),

      simularNovoPedido: () =>
        set((s) => {
          const cliente = CLIENTES[Math.floor(Math.random() * CLIENTES.length)];
          const personalizados = s.itens.filter((i) => i.modeloArte === "personalizado" && i.clienteId === cliente.id);
          const padroes = s.itens.filter((i) => i.modeloArte !== "personalizado" && i.categoria !== "Ferramental");
          const candidatos = [
            personalizados[0],
            padroes[Math.floor(Math.random() * padroes.length)],
            padroes[Math.floor(Math.random() * padroes.length)],
          ].filter((item, i, arr): item is Item => Boolean(item) && arr.findIndex((x) => x?.id === item.id) === i);

          const itensPedido = candidatos.slice(0, 3).map((item) => ({
            itemId: item.id,
            quantidade: Math.max(2, Math.round(2 + Math.random() * 10)),
            quantidadeSeparada: 0,
          }));

          const hoje = new Date();
          const prevista = new Date(hoje);
          prevista.setDate(prevista.getDate() + 2 + Math.floor(Math.random() * 3));

          const novoPedido: Pedido = {
            id: `pedido-${Date.now()}`,
            numero: `PED-${2026100 + Math.floor(Math.random() * 900)}`,
            clienteId: cliente.id,
            status: "aberto",
            itens: itensPedido,
            dataCriacao: hoje.toISOString().slice(0, 10),
            dataPrevista: prevista.toISOString().slice(0, 10),
          };

          return { pedidos: [novoPedido, ...s.pedidos] };
        }),

      gerarContagem: (classe, quantidade = 8) =>
        set((s) => {
          const elegiveis = s.itens.filter((i) => i.categoria !== "Ferramental" && (!classe || i.classeAbc === classe) && i.localizacaoPrincipalId);
          const amostra = elegiveis.sort(() => Math.random() - 0.5).slice(0, quantidade);
          const novasContagens: ContagemInventario[] = amostra.map((item) => ({
            id: `contagem-${Date.now()}-${item.id}`,
            itemId: item.id,
            localizacaoId: item.localizacaoPrincipalId!,
            saldoSistema: item.saldoDisponivel,
            status: "pendente",
            classeAbc: item.classeAbc,
          }));
          return { contagens: [...novasContagens, ...s.contagens] };
        }),

      registrarContagem: (contagemId, saldoContado) =>
        set((s) => ({
          contagens: s.contagens.map((c) =>
            c.id === contagemId
              ? {
                  ...c,
                  saldoContado,
                  status: saldoContado === c.saldoSistema ? "conferida" : "divergente",
                  timestamp: new Date().toISOString(),
                }
              : c
          ),
        })),

      ajustarSaldoContagem: (contagemId) =>
        set((s) => {
          const contagem = s.contagens.find((c) => c.id === contagemId);
          if (!contagem || contagem.saldoContado === undefined) return s;
          const movimentos = [...s.movimentos];
          logMovimento(movimentos, "ajuste", contagem.itemId, contagem.saldoContado - contagem.saldoSistema, {
            referencia: contagemId,
          });
          return {
            itens: s.itens.map((i) => (i.id === contagem.itemId ? { ...i, saldoDisponivel: contagem.saldoContado! } : i)),
            contagens: s.contagens.map((c) => (c.id === contagemId ? { ...c, status: "conferida" as const } : c)),
            movimentos,
          };
        }),

      adicionarMensagemCopiloto: (mensagem) =>
        set((s) => ({ mensagensCopiloto: [...s.mensagensCopiloto, mensagem] })),
    }),
    {
      name: "braspel-wms-demo",
      version: 1,
      skipHydration: true,
    }
  )
);

export function selecionarItemPorId(itens: Item[], id: string) {
  return itens.find((i) => i.id === id);
}
