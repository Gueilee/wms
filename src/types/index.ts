// Modelo de dados da demonstração — construído a partir da análise real do
// catálogo, do layout físico e do ERP atual da Braspel Embalagens.
// Ver memória do projeto para o racional de cada decisão de modelagem.

export type PerfilUsuario = "gestor" | "operador";

export type ModeloArte = "liso" | "padrao_braspel" | "personalizado";

export type CategoriaItem =
  | "Caixa Delivery"
  | "Caixa Selada"
  | "Sacola"
  | "Saco"
  | "Copo de Papel"
  | "Bobina"
  | "Adesivo"
  | "Papel Acoplado"
  | "Toalha Americana"
  | "Ferramental";

export type UnidadeMedida = "unidade" | "pacote" | "fardo" | "bobina";

export type ClasseAbc = "A" | "B" | "C";

export type StatusLocalizacao = "livre" | "ocupado" | "bloqueado";

export interface Localizacao {
  id: string;
  rua: string;
  altura: string; // "00", "01", "02" — "00" é o nível do chão
  posicao: string;
  codigo: string; // RUA.ALTURA.POSIÇÃO
  capacidadeUnidades: number;
  status: StatusLocalizacao;
  itemId?: string;
  loteId?: string;
  quantidadeArmazenada?: number;
  motivoBloqueio?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  segmento: string;
}

export interface Cliche {
  id: string;
  clienteId: string;
  arteDescricao: string;
  itemIds: string[];
  status: "ativo" | "inativo";
  localizacaoGuarda: string;
  ultimoUso: string;
}

export interface Item {
  id: string;
  codigo: string;
  nome: string;
  categoria: CategoriaItem;
  modeloArte: ModeloArte;
  clienteId?: string; // só quando modeloArte === "personalizado"
  material: string;
  gramatura?: string;
  cor?: string;
  dimensoes?: string;
  unidadeMedida: UnidadeMedida;
  unidadesPorPacote?: number;
  saldoDisponivel: number;
  saldoReservado: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  classeAbc: ClasseAbc;
  valorUnitario: number;
  loteValidadeControlado: boolean;
  localizacaoPrincipalId?: string;
  imagemCor: string; // cor hex p/ miniatura visual na UI
}

export interface Lote {
  id: string;
  itemId: string;
  numeroLote: string;
  dataFabricacao: string;
  dataValidade?: string;
  quantidade: number;
  localizacaoId?: string;
}

export type StatusPedido =
  | "aberto"
  | "separando"
  | "separado"
  | "embalado"
  | "expedido";

export interface ItemPedido {
  itemId: string;
  quantidade: number;
  quantidadeSeparada: number;
}

export interface Pedido {
  id: string;
  numero: string;
  clienteId: string;
  status: StatusPedido;
  itens: ItemPedido[];
  dataCriacao: string;
  dataPrevista: string;
  transportadora?: string;
  notaFiscalSaidaId?: string;
}

export type TipoMovimento =
  | "recebimento"
  | "putaway"
  | "picking"
  | "packing"
  | "expedicao"
  | "inventario"
  | "ajuste";

export interface MovimentoEstoque {
  id: string;
  tipo: TipoMovimento;
  itemId: string;
  localizacaoOrigemId?: string;
  localizacaoDestinoId?: string;
  quantidade: number;
  timestamp: string;
  usuario: string;
  referencia?: string; // nº do pedido/recebimento relacionado
}

export type StatusContagem = "pendente" | "divergente" | "conferida";

export interface ContagemInventario {
  id: string;
  itemId: string;
  localizacaoId: string;
  saldoSistema: number;
  saldoContado?: number;
  status: StatusContagem;
  classeAbc: ClasseAbc;
  timestamp?: string;
}

export type TipoAlerta =
  | "estoque_baixo"
  | "validade_proxima"
  | "divergencia_inventario"
  | "pedido_atrasado"
  | "posicao_bloqueada";

export type SeveridadeAlerta = "info" | "atencao" | "critico";

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  mensagem: string;
  itemId?: string;
  timestamp: string;
  resolvido: boolean;
}

export interface RecebimentoPendente {
  id: string;
  numero: string;
  fornecedorOuProducao: string;
  itens: { itemId: string; quantidadeEsperada: number }[];
  dataPrevista: string;
  notaFiscalId?: string;
}

export type TipoNotaFiscal = "entrada" | "saida";

export interface ItemNotaFiscal {
  itemId?: string;
  descricao: string;
  ncm: string;
  cfop: string;
  quantidade: number;
  valorUnitario: number;
}

export interface NotaFiscal {
  id: string;
  tipo: TipoNotaFiscal;
  numero: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  cnpjEmitente: string;
  nomeEmitente: string;
  cnpjDestinatario: string;
  nomeDestinatario: string;
  valorTotal: number;
  itens: ItemNotaFiscal[];
}

export interface MensagemCopiloto {
  id: string;
  role: "user" | "assistant";
  content: string;
}
