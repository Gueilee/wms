"use client";

import { useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useWmsStore } from "@/store/useWmsStore";
import { useAlertasAtivos, calcularOcupacao } from "@/lib/selectors";
import { CLIENTES } from "@/data/seed/clients";

const SUGESTOES = [
  "Quais itens estão abaixo do estoque mínimo?",
  "Quantas caixas personalizadas da Hamburgueria do Zé eu tenho?",
  "Qual lote de matéria-prima vence primeiro?",
  "Quantas posições do armazém estão livres agora?",
];

export function CopilotWidget() {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados, mensagensCopiloto, adicionarMensagemCopiloto } =
    useWmsStore();

  const alertas = useAlertasAtivos(itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados);
  const ocupacao = calcularOcupacao(localizacoes);

  async function enviar(texto: string) {
    if (!texto.trim() || carregando) return;
    const minhaMsg = { id: `msg-${crypto.randomUUID()}`, role: "user" as const, content: texto };
    adicionarMensagemCopiloto(minhaMsg);
    setPergunta("");
    setCarregando(true);

    const contexto = {
      itens: itens
        .filter((i) => i.categoria !== "Ferramental")
        .map((i) => ({
          nome: i.nome,
          categoria: i.categoria,
          modeloArte: i.modeloArte,
          cliente: i.clienteId ? CLIENTES.find((c) => c.id === i.clienteId)?.nome : undefined,
          saldoDisponivel: i.saldoDisponivel,
          estoqueMinimo: i.estoqueMinimo,
          unidadeMedida: i.unidadeMedida,
          classeAbc: i.classeAbc,
          valorUnitario: i.valorUnitario,
          localizacao: localizacoes.find((l) => l.id === i.localizacaoPrincipalId)?.codigo,
        })),
      alertas: alertas.map((a) => ({ tipo: a.tipo, severidade: a.severidade, mensagem: a.mensagem })),
      pedidos: pedidos.map((p) => ({
        numero: p.numero,
        cliente: CLIENTES.find((c) => c.id === p.clienteId)?.nome ?? "",
        status: p.status,
      })),
      ocupacao,
    };

    try {
      const resp = await fetch("/api/copiloto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: texto,
          contexto,
          historico: mensagensCopiloto.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await resp.json();
      adicionarMensagemCopiloto({ id: `msg-${crypto.randomUUID()}`, role: "assistant", content: data.reply });
    } catch {
      adicionarMensagemCopiloto({
        id: `msg-${crypto.randomUUID()}`,
        role: "assistant",
        content: "Não consegui me conectar ao serviço de IA agora.",
      });
    } finally {
      setCarregando(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand-green-700 text-white px-4 py-3.5 shadow-lg shadow-black/20 hover:bg-brand-green-600 transition-colors cursor-pointer"
      >
        <Sparkles size={18} />
        <span className="text-sm font-semibold hidden sm:inline">Copiloto IA</span>
      </button>

      {aberto && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-96 h-[32rem] max-h-[70vh] rounded-(--radius-lg) border border-border bg-surface shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-brand-green-700 text-white shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={16} />
              Copiloto de estoque
            </div>
            <button onClick={() => setAberto(false)} className="cursor-pointer" aria-label="Fechar copiloto">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-sm">
            {mensagensCopiloto.length === 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-text-muted">
                  Pergunte qualquer coisa sobre o estoque, pedidos ou ocupação do armazém — eu respondo com base nos
                  dados ao vivo desta demonstração.
                </p>
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="text-left rounded-(--radius-md) border border-border px-3 py-2 text-xs text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {mensagensCopiloto.map((m) => (
              <div
                key={m.id}
                className={clsx(
                  "max-w-[85%] rounded-(--radius-md) px-3 py-2 whitespace-pre-wrap",
                  m.role === "user" ? "self-end bg-brand-bronze-500 text-white" : "self-start bg-surface-muted text-text"
                )}
              >
                {m.content}
              </div>
            ))}
            {carregando && (
              <div className="self-start flex items-center gap-2 text-text-faint text-xs">
                <Loader2 size={14} className="animate-spin" /> pensando…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(pergunta);
            }}
            className="flex items-center gap-2 border-t border-border p-3 shrink-0"
          >
            <input
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Pergunte sobre o estoque…"
              className="flex-1 rounded-(--radius-md) border border-border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-bronze-500"
            />
            <button
              type="submit"
              disabled={carregando}
              className="flex items-center justify-center h-9 w-9 rounded-(--radius-md) bg-brand-green-700 text-white disabled:opacity-50 cursor-pointer"
              aria-label="Enviar"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
