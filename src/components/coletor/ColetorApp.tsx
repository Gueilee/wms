"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BatteryFull,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MapPin,
  PackageCheck,
  PartyPopper,
  ScanLine,
  Wifi,
} from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { useEscanear } from "@/hooks/useEscanear";
import { useAgora } from "@/hooks/useAgora";
import { CLIENTES } from "@/data/seed/clients";
import { NumericKeypad } from "./NumericKeypad";
import { formatarNumero } from "@/lib/format";
import type { Item, Localizacao, Pedido, RecebimentoPendente } from "@/types";

type Tela = "menu" | "recebimento" | "separacao";

export function ColetorApp() {
  const [tela, setTela] = useState<Tela>("menu");
  const agora = useAgora(30_000);
  const hora = new Date(agora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-full w-full flex flex-col bg-[#0c0f0c] text-white font-sans">
      <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-white/70 shrink-0">
        <span className="tabular">{hora}</span>
        <div className="flex items-center gap-1">
          <Wifi size={10} />
          <BatteryFull size={11} />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {tela === "menu" && <MenuColetor onEscolher={setTela} />}
        {tela === "recebimento" && <FluxoRecebimento onSair={() => setTela("menu")} />}
        {tela === "separacao" && <FluxoSeparacao onSair={() => setTela("menu")} />}
      </div>
    </div>
  );
}

function CabecalhoTela({ titulo, onVoltar }: { titulo: string; onVoltar: () => void }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-white/10 shrink-0">
      <button onClick={onVoltar} className="cursor-pointer text-white/70" aria-label="Voltar">
        <ArrowLeft size={16} />
      </button>
      <span className="text-xs font-semibold truncate">{titulo}</span>
    </div>
  );
}

function MenuColetor({ onEscolher }: { onEscolher: (t: Tela) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-[11px] text-white/50 mb-1">GIROU WMS · coletor</p>
      <button
        onClick={() => onEscolher("recebimento")}
        className="w-full max-w-[180px] flex flex-col items-center gap-2 rounded-xl bg-white/10 py-4 cursor-pointer active:bg-white/20"
      >
        <PackageCheck size={26} />
        <span className="text-xs font-semibold">Recebimento</span>
      </button>
      <button
        onClick={() => onEscolher("separacao")}
        className="w-full max-w-[180px] flex flex-col items-center gap-2 rounded-xl bg-white/10 py-4 cursor-pointer active:bg-white/20"
      >
        <ClipboardList size={26} />
        <span className="text-xs font-semibold">Separação</span>
      </button>
    </div>
  );
}

function BotaoEscanear({ onConcluir, rotulo = "ESCANEAR" }: { onConcluir: () => void; rotulo?: string }) {
  const { escaneando, disparar } = useEscanear();
  return (
    <div className="relative">
      <button
        onClick={() => disparar(onConcluir)}
        disabled={escaneando}
        className="w-full rounded-lg bg-brand-bronze-500 text-white text-sm font-bold py-3.5 flex items-center justify-center gap-2 cursor-pointer active:bg-brand-bronze-600 disabled:opacity-80"
      >
        <ScanLine size={16} /> {escaneando ? "Lendo…" : rotulo}
      </button>
      {escaneando && (
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] animate-pulse" />
      )}
    </div>
  );
}

function TelaConcluido({ mensagem, onConcluir }: { mensagem: string; onConcluir: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 px-4 text-center">
      <PartyPopper size={28} className="text-brand-bronze-300" />
      <p className="text-sm font-bold">{mensagem}</p>
      <button
        onClick={onConcluir}
        className="rounded-lg bg-brand-green-700 text-white text-xs font-bold px-4 py-2.5 cursor-pointer active:bg-brand-green-600"
      >
        CONCLUIR
      </button>
    </div>
  );
}

// ---------- Recebimento: lista de NF-e -> lista de itens -> tarefa ----------

function FluxoRecebimento({ onSair }: { onSair: () => void }) {
  const { recebimentosPendentes, itens, sugerirEndereco, confirmarPutaway, simularChegadaNfe } = useWmsStore();
  const [recebimentoId, setRecebimentoId] = useState<string | null>(null);
  const [itemAtivoId, setItemAtivoId] = useState<string | null>(null);
  const [etapaTarefa, setEtapaTarefa] = useState<"escanear" | "quantidade" | "enderecar">("escanear");
  const [quantidadeTexto, setQuantidadeTexto] = useState("");

  const recebimento = recebimentosPendentes.find((r) => r.id === recebimentoId) ?? null;

  function abrirItem(itemId: string, quantidadeEsperada: number) {
    setItemAtivoId(itemId);
    setEtapaTarefa("escanear");
    setQuantidadeTexto(String(quantidadeEsperada));
  }

  function avancarAposConfirmar(rec: RecebimentoPendente, itemIdConcluido: string) {
    const restantes = rec.itens.filter((l) => l.itemId !== itemIdConcluido);
    if (restantes.length > 0) {
      abrirItem(restantes[0].itemId, restantes[0].quantidadeEsperada);
    } else {
      setItemAtivoId(null);
    }
  }

  if (!recebimento) {
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo="Recebimento" onVoltar={onSair} />
        {recebimentosPendentes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <CheckCircle2 size={28} className="text-status-ok" />
            <p className="text-xs text-white/70">Nenhum recebimento pendente.</p>
            <button
              onClick={simularChegadaNfe}
              className="rounded-lg bg-brand-green-700 text-white text-xs font-semibold px-3 py-2.5 cursor-pointer active:bg-brand-green-600"
            >
              Simular chegada de NF-e
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-white/10">
            {recebimentosPendentes.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setRecebimentoId(rec.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left cursor-pointer active:bg-white/10"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{rec.numero}</p>
                  <p className="text-[10px] text-white/50 truncate">{rec.fornecedorOuProducao}</p>
                  <p className="text-[10px] text-brand-bronze-300 mt-0.5">{rec.itens.length} item(ns)</p>
                </div>
                <ChevronRight size={16} className="text-white/40 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const itemAtivo = itemAtivoId ? itens.find((i) => i.id === itemAtivoId) : undefined;
  const linhaAtiva = itemAtivoId ? recebimento.itens.find((l) => l.itemId === itemAtivoId) : undefined;

  if (!itemAtivo || !linhaAtiva) {
    // Lista de itens da NF-e selecionada.
    if (recebimento.itens.length === 0) {
      return (
        <TelaConcluido
          mensagem={`NF-e ${recebimento.numero} totalmente endereçada!`}
          onConcluir={() => setRecebimentoId(null)}
        />
      );
    }
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo={recebimento.numero} onVoltar={() => setRecebimentoId(null)} />
        <div className="flex-1 overflow-y-auto divide-y divide-white/10">
          {recebimento.itens.map((linha) => {
            const item = itens.find((i) => i.id === linha.itemId);
            if (!item) return null;
            return (
              <button
                key={linha.itemId}
                onClick={() => abrirItem(linha.itemId, linha.quantidadeEsperada)}
                className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left cursor-pointer active:bg-white/10"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{item.nome}</p>
                  <p className="text-[10px] text-white/50">
                    {formatarNumero(linha.quantidadeEsperada)} {item.unidadeMedida}
                  </p>
                </div>
                <ChevronRight size={16} className="text-white/40 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const sugestao = sugerirEndereco(itemAtivo.id);

  return (
    <div className="h-full flex flex-col">
      <CabecalhoTela titulo={itemAtivo.nome} onVoltar={() => setItemAtivoId(null)} />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-2">
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">
            {etapaTarefa === "escanear" ? "Escaneie o item" : etapaTarefa === "quantidade" ? "Confira a quantidade" : "Confirme o endereço"}
          </p>
          <p className="text-sm font-bold leading-tight">{itemAtivo.nome}</p>
          <p className="text-[11px] text-white/60 mt-0.5">
            Esperado: {formatarNumero(linhaAtiva.quantidadeEsperada)} {itemAtivo.unidadeMedida}
          </p>
        </div>

        {etapaTarefa === "escanear" && <BotaoEscanear onConcluir={() => setEtapaTarefa("quantidade")} />}

        {etapaTarefa === "quantidade" && (
          <div className="flex flex-col gap-1.5">
            <div className="rounded-lg bg-white/10 py-1.5 text-center text-xl font-bold tabular">{quantidadeTexto || "0"}</div>
            <NumericKeypad
              onDigit={(d) => setQuantidadeTexto((q) => (q === "0" ? d : q + d).slice(0, 6))}
              onBackspace={() => setQuantidadeTexto((q) => q.slice(0, -1))}
            />
            <button
              onClick={() => setEtapaTarefa("enderecar")}
              className="rounded-lg bg-brand-bronze-500 text-white text-sm font-bold py-2 cursor-pointer active:bg-brand-bronze-600"
            >
              OK
            </button>
          </div>
        )}

        {etapaTarefa === "enderecar" && (
          <div className="flex flex-col gap-2.5">
            <div className="rounded-lg bg-white/10 py-3 flex flex-col items-center gap-1">
              <MapPin size={18} className="text-brand-bronze-300" />
              <span className="text-lg font-bold tabular">{sugestao?.codigo ?? "sem posição"}</span>
              <span className="text-[10px] text-white/50">posição sugerida</span>
            </div>
            <button
              disabled={!sugestao}
              onClick={() => {
                if (!sugestao) return;
                confirmarPutaway(recebimento.id, itemAtivo.id, Number(quantidadeTexto) || 0, sugestao.id);
                avancarAposConfirmar(recebimento, itemAtivo.id);
              }}
              className="rounded-lg bg-brand-green-700 text-white text-sm font-bold py-3 cursor-pointer active:bg-brand-green-600 disabled:opacity-50"
            >
              CONFIRMAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Separação: lista de pedidos -> lista de itens -> tarefa ----------

interface LinhaSeparacao {
  itemId: string;
  item?: Item;
  loc?: Localizacao;
  quantidade: number;
  quantidadeSeparada: number;
  restante: number;
  concluida: boolean;
}

function linhasDoPedido(pedido: Pedido, itens: Item[], localizacoes: Localizacao[]): LinhaSeparacao[] {
  const linhas = pedido.itens.map((it) => {
    const item = itens.find((i) => i.id === it.itemId);
    const loc = item?.localizacaoPrincipalId ? localizacoes.find((l) => l.id === item.localizacaoPrincipalId) : undefined;
    return {
      itemId: it.itemId,
      item,
      loc,
      quantidade: it.quantidade,
      quantidadeSeparada: it.quantidadeSeparada,
      restante: it.quantidade - it.quantidadeSeparada,
      concluida: it.quantidadeSeparada >= it.quantidade,
    };
  });
  return linhas.sort((a, b) => (a.loc?.codigo ?? "zzz").localeCompare(b.loc?.codigo ?? "zzz"));
}

function FluxoSeparacao({ onSair }: { onSair: () => void }) {
  const { pedidos, itens, localizacoes, iniciarSeparacao, confirmarPick, simularNovoPedido } = useWmsStore();
  const { escaneando, disparar } = useEscanear();
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [itemAtivoId, setItemAtivoId] = useState<string | null>(null);

  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== "embalado" && p.status !== "expedido" && p.itens.some((it) => it.quantidadeSeparada < it.quantidade)
  );
  const pedido = pedidos.find((p) => p.id === pedidoId) ?? null;

  function iniciarItem(linha: LinhaSeparacao) {
    if (!linha.item) return;
    setItemAtivoId(linha.itemId);
  }

  if (!pedido) {
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo="Separação" onVoltar={onSair} />
        {pedidosAtivos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <CheckCircle2 size={28} className="text-status-ok" />
            <p className="text-xs text-white/70">Nenhuma separação pendente.</p>
            <button
              onClick={simularNovoPedido}
              className="rounded-lg bg-brand-green-700 text-white text-xs font-semibold px-3 py-2.5 cursor-pointer active:bg-brand-green-600"
            >
              Simular novo pedido
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-white/10">
            {pedidosAtivos.map((p) => {
              const cliente = CLIENTES.find((c) => c.id === p.clienteId);
              const pendentes = p.itens.filter((it) => it.quantidadeSeparada < it.quantidade).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setPedidoId(p.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left cursor-pointer active:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{p.numero}</p>
                    <p className="text-[10px] text-white/50 truncate">{cliente?.nome}</p>
                    <p className="text-[10px] text-brand-bronze-300 mt-0.5">{pendentes} item(ns) pendente(s)</p>
                  </div>
                  <ChevronRight size={16} className="text-white/40 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const linhas = linhasDoPedido(pedido, itens, localizacoes);
  const linhaAtiva = itemAtivoId ? linhas.find((l) => l.itemId === itemAtivoId) : undefined;
  const todasConcluidas = linhas.every((l) => l.concluida);

  if (todasConcluidas) {
    return <TelaConcluido mensagem={`Pedido ${pedido.numero} separado!`} onConcluir={() => setPedidoId(null)} />;
  }

  if (!linhaAtiva || !linhaAtiva.item) {
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo={pedido.numero} onVoltar={() => setPedidoId(null)} />
        <div className="flex-1 overflow-y-auto divide-y divide-white/10">
          {linhas.map((linha) => (
            <button
              key={linha.itemId}
              onClick={() => iniciarItem(linha)}
              disabled={linha.concluida}
              className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left cursor-pointer active:bg-white/10 disabled:cursor-default"
            >
              <div className="min-w-0 flex items-center gap-2">
                {linha.concluida ? (
                  <CheckCircle2 size={14} className="text-status-ok shrink-0" />
                ) : (
                  <MapPin size={14} className="text-brand-bronze-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${linha.concluida ? "line-through text-white/40" : ""}`}>
                    {linha.item?.nome}
                  </p>
                  <p className="text-[10px] text-white/50">
                    {linha.loc?.codigo ?? "sem posição"} · {formatarNumero(linha.restante)} {linha.item?.unidadeMedida}
                  </p>
                </div>
              </div>
              {!linha.concluida && <ChevronRight size={16} className="text-white/40 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const pct = linhaAtiva.quantidade > 0 ? Math.round((linhaAtiva.quantidadeSeparada / linhaAtiva.quantidade) * 100) : 0;
  const ultimaUnidade = linhaAtiva.restante <= 1;

  return (
    <div className="h-full flex flex-col">
      <CabecalhoTela titulo={`${pedido.numero}`} onVoltar={() => setItemAtivoId(null)} />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-2">
        <p className="text-[10px] text-white/50 uppercase tracking-wide">Vá até a posição</p>
        <div className="rounded-lg bg-white/10 py-2 flex flex-col items-center gap-0.5">
          <MapPin size={15} className="text-brand-bronze-300" />
          <span className="text-lg font-bold tabular leading-tight">{linhaAtiva.loc?.codigo ?? "sem posição"}</span>
        </div>

        <p className="text-sm font-bold leading-tight">{linhaAtiva.item.nome}</p>

        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>Bipe uma unidade por vez</span>
          <span className="tabular font-semibold text-white">
            {formatarNumero(linhaAtiva.quantidadeSeparada)}/{formatarNumero(linhaAtiva.quantidade)} {linhaAtiva.item.unidadeMedida}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-brand-bronze-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="relative mt-1">
          <button
            onClick={() =>
              disparar(() => {
                if (pedido.status === "aberto") iniciarSeparacao(pedido.id);
                confirmarPick(pedido.id, linhaAtiva.item!.id, 1);
                if (ultimaUnidade) {
                  // Última unidade desta linha — usa a lista já calculada neste
                  // render (o estado pós-ação só chega no próximo render) para
                  // decidir a próxima linha pendente.
                  const proxima = linhas.find((l) => !l.concluida && l.itemId !== linhaAtiva.itemId);
                  setItemAtivoId(proxima ? proxima.itemId : null);
                }
              })
            }
            disabled={escaneando}
            className="w-full rounded-lg bg-brand-bronze-500 text-white text-sm font-bold py-3 flex items-center justify-center gap-2 cursor-pointer active:bg-brand-bronze-600 disabled:opacity-80"
          >
            <ScanLine size={16} /> {escaneando ? "Lendo…" : "ESCANEAR ITEM"}
          </button>
          {escaneando && (
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
