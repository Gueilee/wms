"use client";

import { useState } from "react";
import { FileText, Code2 } from "lucide-react";
import type { NotaFiscal } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { gerarXmlResumo } from "@/lib/fiscal";
import { formatarMoeda } from "@/lib/format";

export function NotaFiscalCard({ nota }: { nota: NotaFiscal }) {
  const [verXml, setVerXml] = useState(false);
  const chaveFormatada = nota.chaveAcesso.replace(/(\d{4})(?=\d)/g, "$1 ");

  return (
    <div className="rounded-(--radius-md) border border-border bg-surface-muted/40 p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={15} className="text-brand-bronze-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text">
              NF-e {nota.numero}/{nota.serie} · {nota.tipo === "entrada" ? "Entrada" : "Saída"}
            </p>
            <p className="text-[11px] text-text-faint truncate" title={nota.cnpjEmitente}>
              {nota.tipo === "entrada" ? nota.nomeEmitente : nota.nomeDestinatario}
            </p>
          </div>
        </div>
        <Badge tom="info">{formatarMoeda(nota.valorTotal)}</Badge>
      </div>

      <p className="text-[11px] font-mono text-text-faint truncate" title={nota.chaveAcesso}>
        Chave: {chaveFormatada}
      </p>

      <button
        onClick={() => setVerXml((v) => !v)}
        className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-brand-bronze-600 hover:underline cursor-pointer"
      >
        <Code2 size={12} /> {verXml ? "Ocultar XML" : "Ver XML"}
      </button>

      {verXml && (
        <pre className="text-[10px] leading-relaxed bg-(--girou-ink) text-white/80 rounded-(--radius-sm) p-3 overflow-x-auto max-h-64 overflow-y-auto">
          {gerarXmlResumo(nota)}
        </pre>
      )}
    </div>
  );
}
