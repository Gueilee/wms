"use client";

import Link from "next/link";
import { Boxes, Package, AlertTriangle, Gauge, ArrowRight } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { PageHeader, Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { AbcBarChart } from "@/components/charts/AbcBarChart";
import { OcupacaoPorRuaChart } from "@/components/charts/OcupacaoPorRuaChart";
import {
  calcularAcuraciaInventario,
  calcularDistribuicaoAbc,
  calcularOcupacao,
  calcularValorEstoque,
  itensAbaixoDoMinimo,
  useAlertasAtivos,
} from "@/lib/selectors";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { CLIENTES } from "@/data/seed/clients";
import { LABEL_STATUS_PEDIDO } from "@/lib/constants";

export default function DashboardPage() {
  const { itens, localizacoes, lotes, pedidos, contagens, alertasIgnorados } = useWmsStore();

  const ocupacao = calcularOcupacao(localizacoes);
  const valorEstoque = calcularValorEstoque(itens);
  const abaixoDoMinimo = itensAbaixoDoMinimo(itens);
  const distribuicaoAbc = calcularDistribuicaoAbc(itens);
  const acuracia = calcularAcuraciaInventario(contagens);
  const alertas = useAlertasAtivos(itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados);
  const pedidosAbertos = pedidos.filter((p) => p.status !== "expedido");

  return (
    <div>
      <PageHeader
        titulo="Dashboard executivo"
        descricao="Visão consolidada do armazém em tempo real — dados desta demonstração."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          rotulo="Valor de estoque"
          valor={formatarMoeda(valorEstoque)}
          icone={<Package size={18} />}
          variacao={`${itens.filter((i) => i.categoria !== "Ferramental").length} SKUs ativos`}
        />
        <KpiCard
          rotulo="Ocupação do armazém"
          valor={`${ocupacao.percentual}%`}
          icone={<Boxes size={18} />}
          variacao={`${ocupacao.livres} posições livres de ${ocupacao.total}`}
          tomVariacao="ok"
        />
        <KpiCard
          rotulo="Itens abaixo do mínimo"
          valor={formatarNumero(abaixoDoMinimo.length)}
          icone={<AlertTriangle size={18} />}
          variacao={abaixoDoMinimo.length > 0 ? "requer reposição" : "tudo normalizado"}
          tomVariacao={abaixoDoMinimo.length > 0 ? "atencao" : "ok"}
          destaque={abaixoDoMinimo.length > 0}
        />
        <KpiCard
          rotulo="Acurácia de inventário"
          valor={acuracia === null ? "—" : `${acuracia}%`}
          icone={<Gauge size={18} />}
          variacao={acuracia === null ? "rode uma contagem cíclica" : "últimas contagens"}
          tomVariacao={acuracia === null ? "neutro" : acuracia >= 95 ? "ok" : "atencao"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-1">
          <h3 className="font-display font-semibold text-sm mb-1">Curva ABC por valor</h3>
          <p className="text-xs text-text-muted mb-3">Classificação automática pelo valor em estoque (saldo × custo).</p>
          <AbcBarChart dados={distribuicaoAbc} />
          <div className="flex justify-between text-xs text-text-muted mt-2 px-1">
            {distribuicaoAbc.map((d) => (
              <span key={d.classe}>
                Classe {d.classe}: {d.itens} itens ({d.percentual.toFixed(0)}%)
              </span>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-1">Ocupação por rua</h3>
          <p className="text-xs text-text-muted mb-3">Posições ocupadas, livres e bloqueadas em cada rua do armazém.</p>
          <OcupacaoPorRuaChart localizacoes={localizacoes} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm">Alertas recentes</h3>
            <Link href="/alertas" className="text-xs text-brand-bronze-600 font-semibold flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {alertas.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <Badge tom={a.severidade === "critico" ? "critico" : a.severidade === "atencao" ? "atencao" : "info"}>
                  {a.severidade}
                </Badge>
                <span className="text-text-muted">{a.mensagem}</span>
              </div>
            ))}
            {alertas.length === 0 && <p className="text-sm text-text-faint">Nenhum alerta ativo no momento.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm">Pedidos em andamento</h3>
            <Link href="/separacao" className="text-xs text-brand-bronze-600 font-semibold flex items-center gap-1 hover:underline">
              Ir para separação <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {pedidosAbertos.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-text">
                  {p.numero} · <span className="text-text-muted">{CLIENTES.find((c) => c.id === p.clienteId)?.nome}</span>
                </span>
                <Badge tom={p.status === "aberto" ? "neutro" : "info"}>{LABEL_STATUS_PEDIDO[p.status]}</Badge>
              </div>
            ))}
            {pedidosAbertos.length === 0 && <p className="text-sm text-text-faint">Nenhum pedido em aberto.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
