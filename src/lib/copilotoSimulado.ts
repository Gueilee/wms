// Motor de respostas do copiloto SEM custo de API — usado enquanto não há
// contrato assinado (e portanto nenhuma ANTHROPIC_API_KEY configurada).
// Interpreta os padrões de pergunta mais comuns e calcula a resposta a partir
// dos dados fictícios ao vivo da demonstração, para que a experiência pareça
// (e, de fato, seja) uma IA respondendo sobre o estoque — só que por regras,
// não por um modelo de linguagem. Quando o contrato for assinado e a chave
// configurada, a rota /api/copiloto passa a usar a Claude de verdade sem
// nenhuma mudança no front-end.

interface ItemContexto {
  nome: string;
  categoria: string;
  modeloArte: string;
  cliente?: string;
  saldoDisponivel: number;
  estoqueMinimo: number;
  unidadeMedida: string;
  classeAbc: string;
  valorUnitario: number;
  localizacao?: string;
}

interface Contexto {
  itens: ItemContexto[];
  alertas: { tipo: string; severidade: string; mensagem: string }[];
  pedidos: { numero: string; cliente: string; status: string }[];
  ocupacao: { total: number; ocupadas: number; bloqueadas: number; livres: number };
}

function semAcento(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function formatarMoedaSimples(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function responderPerguntaSimulada(perguntaOriginal: string, contexto: Contexto): string {
  const pergunta = semAcento(perguntaOriginal);

  // 1. Itens abaixo do estoque mínimo
  if (/(abaixo do|minimo|estoque baixo|reposicao|repor)/.test(pergunta)) {
    const criticos = contexto.itens.filter((i) => i.saldoDisponivel <= i.estoqueMinimo);
    if (criticos.length === 0) {
      return "Nenhum item está abaixo do estoque mínimo neste momento — todos os níveis estão normalizados.";
    }
    const lista = criticos
      .slice(0, 8)
      .map((i) => `• ${i.nome}: ${i.saldoDisponivel} ${i.unidadeMedida} (mínimo ${i.estoqueMinimo})`)
      .join("\n");
    return `Encontrei ${criticos.length} item(ns) abaixo do estoque mínimo:\n${lista}${
      criticos.length > 8 ? `\n…e mais ${criticos.length - 8}.` : ""
    }`;
  }

  // 2. Validade / vencimento de lotes (usa os alertas já calculados)
  if (/(vence|vencimento|validade|venc)/.test(pergunta)) {
    const validade = contexto.alertas.filter((a) => a.tipo === "validade_proxima");
    if (validade.length === 0) {
      return "Não há nenhum lote com validade próxima no momento — a rastreabilidade está sob controle.";
    }
    return `Lotes com validade próxima:\n${validade.map((a) => `• ${a.mensagem}`).join("\n")}`;
  }

  // 3. Ocupação / posições livres do armazém
  if (/(posicao|posicoes|ocupacao|armazem|livre|livres|galpao)/.test(pergunta)) {
    const { total, ocupadas, bloqueadas, livres } = contexto.ocupacao;
    const pct = total ? Math.round((ocupadas / total) * 100) : 0;
    return `O armazém está com ${pct}% de ocupação: ${ocupadas} posições ocupadas, ${livres} livres e ${bloqueadas} bloqueadas, de um total de ${total}.`;
  }

  // 4. Valor total de estoque
  if (/(valor).*(estoque|total)|quanto.*(vale|estoque)/.test(pergunta)) {
    const valor = contexto.itens.reduce((acc, i) => acc + i.saldoDisponivel * i.valorUnitario, 0);
    return `O valor total do estoque atual é de ${formatarMoedaSimples(valor)}, somando ${contexto.itens.length} SKUs.`;
  }

  // 5. Pedidos atrasados
  if (/(atrasad|pedido)/.test(pergunta) && /(atrasad)/.test(pergunta)) {
    const atrasados = contexto.alertas.filter((a) => a.tipo === "pedido_atrasado");
    if (atrasados.length === 0) return "Nenhum pedido está atrasado no momento.";
    return `Pedidos atrasados:\n${atrasados.map((a) => `• ${a.mensagem}`).join("\n")}`;
  }

  // 6. Pergunta sobre um cliente específico (ex.: itens/caixas personalizadas de X)
  const clientesMencionados = Array.from(new Set(contexto.itens.map((i) => i.cliente).filter(Boolean))) as string[];
  const clienteEncontrado = clientesMencionados.find((c) => pergunta.includes(semAcento(c)));
  if (clienteEncontrado) {
    const doCliente = contexto.itens.filter((i) => i.cliente === clienteEncontrado);
    if (doCliente.length === 0) return `Não encontrei itens personalizados vinculados a ${clienteEncontrado}.`;
    const total = doCliente.reduce((acc, i) => acc + i.saldoDisponivel, 0);
    const detalhe = doCliente.map((i) => `• ${i.nome}: ${i.saldoDisponivel} ${i.unidadeMedida}`).join("\n");
    return `${clienteEncontrado} tem ${doCliente.length} item(ns) personalizado(s) em estoque, totalizando ${total} unidades:\n${detalhe}`;
  }

  // 7. Pergunta sobre uma categoria (caixa, sacola, saco, copo, bobina...)
  const categorias = Array.from(new Set(contexto.itens.map((i) => i.categoria)));
  const categoriaEncontrada = categorias.find((c) => pergunta.includes(semAcento(c.split(" ")[0])));
  if (categoriaEncontrada) {
    const daCategoria = contexto.itens.filter((i) => i.categoria === categoriaEncontrada);
    const total = daCategoria.reduce((acc, i) => acc + i.saldoDisponivel, 0);
    return `Há ${daCategoria.length} SKUs na categoria "${categoriaEncontrada}", somando ${total} unidades em estoque.`;
  }

  // 8. Busca por nome de item mencionado na pergunta
  const itemEncontrado = contexto.itens.find((i) => pergunta.includes(semAcento(i.nome.split(" ").slice(0, 2).join(" "))));
  if (itemEncontrado) {
    return `${itemEncontrado.nome}: ${itemEncontrado.saldoDisponivel} ${itemEncontrado.unidadeMedida} em estoque${
      itemEncontrado.localizacao ? ` na posição ${itemEncontrado.localizacao}` : ""
    }, classe ABC ${itemEncontrado.classeAbc}.`;
  }

  return "Não encontrei dados suficientes para responder com precisão a essa pergunta nesta demonstração. Tente perguntar sobre estoque mínimo, validade de lotes, ocupação do armazém, valor de estoque, pedidos atrasados ou um cliente/categoria específico.";
}
