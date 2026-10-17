"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { LABEL_MODELO_ARTE } from "@/lib/constants";
import { CLIENTES } from "@/data/seed/clients";
import type { CategoriaItem } from "@/types";

const CATEGORIAS: (CategoriaItem | "Todas")[] = [
  "Todas",
  "Caixa Delivery",
  "Caixa Selada",
  "Sacola",
  "Saco",
  "Copo de Papel",
  "Bobina",
  "Adesivo",
  "Papel Acoplado",
  "Toalha Americana",
  "Ferramental",
];

export default function ItensPage() {
  const { itens, localizacoes } = useWmsStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>("Todas");

  const filtrados = useMemo(() => {
    return itens.filter((i) => {
      if (categoria !== "Todas" && i.categoria !== categoria) return false;
      if (busca && !i.nome.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [itens, busca, categoria]);

  return (
    <div>
      <PageHeader
        titulo="Cadastro de itens"
        descricao="Catálogo estruturado por atributos (material, gramatura, modelo de arte) — substitui a descrição em texto livre do ERP atual."
      />

      <Card className="mb-4" padded={false}>
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome do item..."
              className="w-full rounded-(--radius-md) border border-border bg-bg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-bronze-500"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as typeof categoria)}
            className="rounded-(--radius-md) border border-border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-bronze-500"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-faint">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Modelo</th>
                <th className="px-4 py-3 font-medium">Especificação</th>
                <th className="px-4 py-3 font-medium text-right">Saldo</th>
                <th className="px-4 py-3 font-medium text-center">Classe</th>
                <th className="px-4 py-3 font-medium">Posição</th>
                <th className="px-4 py-3 font-medium text-right">Valor total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const loc = localizacoes.find((l) => l.id === item.localizacaoPrincipalId);
                const cliente = item.clienteId ? CLIENTES.find((c) => c.id === item.clienteId) : undefined;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.imagemCor }} />
                        <div>
                          <p className="font-medium text-text leading-tight">{item.nome}</p>
                          {cliente && <p className="text-[11px] text-text-faint">Cliente: {cliente.nome}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">{item.categoria}</td>
                    <td className="px-4 py-2.5">
                      <Badge tom={item.modeloArte === "personalizado" ? "bronze" : "neutro"}>{LABEL_MODELO_ARTE[item.modeloArte]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-text-faint text-xs">
                      {[item.material, item.gramatura, item.dimensoes].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">
                      {formatarNumero(item.saldoDisponivel)} <span className="text-text-faint">{item.unidadeMedida}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge tom={item.classeAbc === "A" ? "ok" : item.classeAbc === "B" ? "info" : "neutro"}>{item.classeAbc}</Badge>
                    </td>
                    <td className="px-4 py-2.5 tabular text-text-muted">{loc?.codigo ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular">{formatarMoeda(item.saldoDisponivel * item.valorUnitario)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && <p className="text-sm text-text-faint text-center py-8">Nenhum item encontrado.</p>}
      </Card>
      <p className="text-xs text-text-faint mt-3">{filtrados.length} de {itens.length} itens</p>
    </div>
  );
}
