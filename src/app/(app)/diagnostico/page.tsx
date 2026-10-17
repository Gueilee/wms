import { AlertTriangle, TrendingDown, FileWarning, MapPinOff } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Ilustrativo: reflete o PADRÃO real encontrado na análise do ERP atual do
// cliente (saldo negativo, categorização inconsistente, sem posição) — não
// expõe nenhum dado real do cliente, só o retrato típico do problema.
const LINHAS_ILUSTRATIVAS = [
  { codigo: "4281", descricao: "Saco N.1/26 Kraft Pardo - 18L x 26A x 10.5 - 80gr - Liso", grupo: "Saco Personalizado", saldo: -7101, posicao: null },
  { codigo: "4283", descricao: "Sacola N.1/31 PAPEL: Kraft 80 g/m² CORES: 1 x 0 Alça Simples...", grupo: "PRODUTOS", saldo: 0, posicao: null },
  { codigo: "4868", descricao: "Faca", grupo: "FACAS", saldo: 1, posicao: null },
  { codigo: "4925", descricao: "Clichê (Arte para Impressão)", grupo: "FACAS", saldo: 1, posicao: null },
  { codigo: "5084", descricao: "FRETE", grupo: "FACAS", saldo: 177, posicao: null },
  { codigo: "4636", descricao: "Sacola N.4/19 - 30L x 38A x 19 - Personalizado", grupo: "PRODUTOS", saldo: -5305528, posicao: null },
];

export default function DiagnosticoPage() {
  return (
    <div>
      <PageHeader
        titulo="Diagnóstico — como a maioria das fábricas de embalagem opera hoje"
        descricao="Retrato ilustrativo, no mesmo padrão encontrado em levantamentos reais do setor: um ERP com módulo de estoque ativo, mas sem controle físico de fato. Esta tela não usa dados reais de nenhum cliente específico."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-status-critical/30">
          <div className="flex items-center gap-2 text-status-critical mb-2">
            <TrendingDown size={18} />
            <span className="text-sm font-semibold">Saldo sem confiabilidade</span>
          </div>
          <p className="font-display text-3xl font-bold tabular">29%</p>
          <p className="text-xs text-text-muted mt-1">dos itens com saldo físico negativo — baixas lançadas sem entrada correspondente.</p>
        </Card>
        <Card className="border-status-blocked/30">
          <div className="flex items-center gap-2 text-status-blocked mb-2">
            <MapPinOff size={18} />
            <span className="text-sm font-semibold">Zero endereçamento</span>
          </div>
          <p className="font-display text-3xl font-bold tabular">0</p>
          <p className="text-xs text-text-muted mt-1">de milhares de SKUs com posição física vinculada no sistema.</p>
        </Card>
        <Card className="border-status-blocked/30">
          <div className="flex items-center gap-2 text-status-blocked mb-2">
            <FileWarning size={18} />
            <span className="text-sm font-semibold">Taxonomia inconsistente</span>
          </div>
          <p className="font-display text-3xl font-bold tabular">1 grupo</p>
          <p className="text-xs text-text-muted mt-1">mistura faca de corte, clichê de impressão e até frete como se fossem o mesmo tipo de item.</p>
        </Card>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <AlertTriangle size={16} className="text-status-critical" />
          <h3 className="font-display font-semibold text-sm">Amostra ilustrativa — export típico de ERP sem WMS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-text-faint">
                <th className="px-5 py-2 font-medium">Código</th>
                <th className="px-5 py-2 font-medium">Descrição</th>
                <th className="px-5 py-2 font-medium">Grupo</th>
                <th className="px-5 py-2 font-medium text-right">Saldo físico</th>
                <th className="px-5 py-2 font-medium">Posição</th>
              </tr>
            </thead>
            <tbody>
              {LINHAS_ILUSTRATIVAS.map((l) => (
                <tr key={l.codigo} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 text-text-faint tabular">{l.codigo}</td>
                  <td className="px-5 py-2.5 max-w-sm truncate" title={l.descricao}>{l.descricao}</td>
                  <td className="px-5 py-2.5">
                    <Badge tom={l.grupo === "FACAS" ? "atencao" : "neutro"}>{l.grupo}</Badge>
                  </td>
                  <td className={`px-5 py-2.5 text-right tabular font-semibold ${l.saldo < 0 ? "text-status-critical" : "text-text"}`}>
                    {l.saldo.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-5 py-2.5 text-text-faint italic">sem posição</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-faint px-5 py-3 border-t border-border">
          Padrão consistente com o que foi encontrado na análise do ERP atual do cliente — ver relatório de diagnóstico do projeto.
        </p>
      </Card>

      <div className="mt-6 rounded-(--radius-lg) border border-brand-green-600/30 bg-brand-green-50 p-5">
        <h3 className="font-display font-semibold text-sm text-brand-green-700 mb-1">
          Com o Braspel WMS, cada um desses problemas vira uma regra do sistema — não uma correção manual recorrente.
        </h3>
        <p className="text-sm text-brand-green-700/80">
          Navegue pelo menu para ver, com dados de demonstração, como o recebimento, o endereçamento e o inventário cíclico eliminam estruturalmente os três problemas acima.
        </p>
      </div>
    </div>
  );
}
