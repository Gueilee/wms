"use client";

import { useState } from "react";
import { ArrowLeft, BatteryFull, CheckCircle2, ClipboardList, MapPin, PackageCheck, ScanLine, Wifi } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { useEscanear } from "@/hooks/useEscanear";
import { useAgora } from "@/hooks/useAgora";
import { NumericKeypad } from "./NumericKeypad";
import { formatarNumero } from "@/lib/format";

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

function CabecalhoTela({ titulo, onSair }: { titulo: string; onSair: () => void }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-white/10 shrink-0">
      <button onClick={onSair} className="cursor-pointer text-white/70" aria-label="Voltar">
        <ArrowLeft size={16} />
      </button>
      <span className="text-xs font-semibold">{titulo}</span>
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

function FluxoRecebimento({ onSair }: { onSair: () => void }) {
  const { recebimentosPendentes, itens, sugerirEndereco, confirmarPutaway, simularChegadaNfe } = useWmsStore();
  const [etapa, setEtapa] = useState<"escanear" | "quantidade" | "enderecar">("escanear");
  const [quantidadeTexto, setQuantidadeTexto] = useState("");

  const filas = recebimentosPendentes.flatMap((rec) =>
    rec.itens.map((linha) => ({ recebimentoId: rec.id, item: itens.find((i) => i.id === linha.itemId), quantidadeEsperada: linha.quantidadeEsperada }))
  );
  const candidata = filas.find((f) => f.item);
  const tarefa = candidata?.item
    ? { recebimentoId: candidata.recebimentoId, item: candidata.item, quantidadeEsperada: candidata.quantidadeEsperada }
    : null;

  if (!tarefa) {
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo="Recebimento" onSair={onSair} />
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
      </div>
    );
  }

  const sugestao = sugerirEndereco(tarefa.item.id);

  return (
    <div className="h-full flex flex-col">
      <CabecalhoTela titulo="Recebimento" onSair={onSair} />
      <div className="flex-1 flex flex-col justify-between px-3 py-3 min-h-0">
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">
            {etapa === "escanear" ? "Escaneie o item" : etapa === "quantidade" ? "Confira a quantidade" : "Confirme o endereço"}
          </p>
          <p className="text-sm font-bold leading-tight">{tarefa.item.nome}</p>
          <p className="text-[11px] text-white/60 mt-0.5">
            Esperado: {formatarNumero(tarefa.quantidadeEsperada)} {tarefa.item.unidadeMedida}
          </p>
        </div>

        {etapa === "escanear" && (
          <BotaoEscanear
            onConcluir={() => {
              setQuantidadeTexto(String(tarefa.quantidadeEsperada));
              setEtapa("quantidade");
            }}
          />
        )}

        {etapa === "quantidade" && (
          <div className="flex flex-col gap-2">
            <div className="rounded-lg bg-white/10 py-2.5 text-center text-2xl font-bold tabular">{quantidadeTexto || "0"}</div>
            <NumericKeypad
              onDigit={(d) => setQuantidadeTexto((q) => (q === "0" ? d : q + d).slice(0, 6))}
              onBackspace={() => setQuantidadeTexto((q) => q.slice(0, -1))}
            />
            <button
              onClick={() => setEtapa("enderecar")}
              className="rounded-lg bg-brand-bronze-500 text-white text-sm font-bold py-2.5 cursor-pointer active:bg-brand-bronze-600"
            >
              OK
            </button>
          </div>
        )}

        {etapa === "enderecar" && (
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
                confirmarPutaway(tarefa.recebimentoId, tarefa.item.id, Number(quantidadeTexto) || 0, sugestao.id);
                setEtapa("escanear");
                setQuantidadeTexto("");
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

function FluxoSeparacao({ onSair }: { onSair: () => void }) {
  const { pedidos, itens, localizacoes, iniciarSeparacao, confirmarPick, simularNovoPedido } = useWmsStore();
  const { escaneando, disparar } = useEscanear();

  const ativos = pedidos.filter((p) => p.status !== "embalado" && p.status !== "expedido");
  const linhas = ativos.flatMap((p) =>
    p.itens
      .filter((it) => it.quantidadeSeparada < it.quantidade)
      .map((it) => {
        const item = itens.find((i) => i.id === it.itemId);
        const loc = item?.localizacaoPrincipalId ? localizacoes.find((l) => l.id === item.localizacaoPrincipalId) : undefined;
        return { pedidoId: p.id, pedidoNumero: p.numero, item, loc, restante: it.quantidade - it.quantidadeSeparada };
      })
  );
  const validas = [...linhas.filter((l) => l.item)].sort((a, b) => (a.loc?.codigo ?? "zzz").localeCompare(b.loc?.codigo ?? "zzz"));
  const tarefa = validas[0] ?? null;

  if (!tarefa) {
    return (
      <div className="h-full flex flex-col">
        <CabecalhoTela titulo="Separação" onSair={onSair} />
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
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CabecalhoTela titulo={`Separação · ${tarefa.pedidoNumero}`} onSair={onSair} />
      <div className="flex-1 flex flex-col justify-between px-3 py-3 min-h-0">
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Vá até a posição</p>
          <div className="rounded-lg bg-white/10 py-3 flex flex-col items-center gap-1 mb-3">
            <MapPin size={18} className="text-brand-bronze-300" />
            <span className="text-xl font-bold tabular">{tarefa.loc?.codigo ?? "sem posição"}</span>
          </div>
          <p className="text-sm font-bold leading-tight">{tarefa.item?.nome}</p>
          <p className="text-[11px] text-white/60 mt-0.5">
            Coletar: {formatarNumero(tarefa.restante)} {tarefa.item?.unidadeMedida}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() =>
              disparar(() => {
                const pedido = pedidos.find((p) => p.id === tarefa.pedidoId);
                if (pedido?.status === "aberto") iniciarSeparacao(tarefa.pedidoId);
                confirmarPick(tarefa.pedidoId, tarefa.item!.id, tarefa.restante);
              })
            }
            disabled={escaneando}
            className="w-full rounded-lg bg-brand-bronze-500 text-white text-sm font-bold py-3.5 flex items-center justify-center gap-2 cursor-pointer active:bg-brand-bronze-600 disabled:opacity-80"
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
