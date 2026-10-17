import type { Cliente, Item, ItemNotaFiscal, NotaFiscal, Pedido } from "@/types";

// Geração de documentos fiscais fictícios (NF-e de entrada/saída) para a
// demonstração — chave de acesso e XML seguem o layout real de uma NFe,
// mas os dados (CNPJ, chave, protocolo) são inteiramente fictícios. Não
// serve para uso fiscal real, só para mostrar ao cliente como o WMS se
// encaixa no fluxo fiscal (consome XML no recebimento, emite na expedição).

interface FornecedorFicticio {
  razaoSocial: string;
  cnpj: string;
  uf: string;
}

const FORNECEDORES: FornecedorFicticio[] = [
  { razaoSocial: "Papelaria Vale do Paraíba Ltda", cnpj: "12.345.678/0001-90", uf: "35" },
  { razaoSocial: "Celulose Sul Indústria de Papéis S.A.", cnpj: "23.456.789/0001-11", uf: "42" },
  { razaoSocial: "Insumos Gráficos Pardo Ltda", cnpj: "34.567.890/0001-22", uf: "35" },
  { razaoSocial: "Distribuidora Kraft Brasil Ltda", cnpj: "45.678.901/0001-33", uf: "41" },
];

const DESTINATARIO_PADRAO = { cnpj: "07.221.966/0001-06", nome: "Roca Equipamentos Ltda (Braspel Embalagens)" };

const NCM_POR_CATEGORIA: Record<string, string> = {
  "Caixa Delivery": "4819.20.00",
  "Caixa Selada": "4819.20.00",
  Sacola: "4819.40.00",
  Saco: "4819.40.00",
  "Copo de Papel": "4823.69.90",
  Bobina: "4804.39.00",
  Adesivo: "4821.10.00",
  "Papel Acoplado": "4811.59.90",
  "Toalha Americana": "4818.90.90",
  Ferramental: "8207.30.00",
};

function pad(valor: string | number, tamanho: number) {
  return String(valor).padStart(tamanho, "0");
}

function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/** Monta uma chave de acesso de 44 dígitos no layout real: UF+AAMM+CNPJ+modelo+série+número+tpEmis+cNF+DV. */
export function gerarChaveAcesso(uf: string, cnpj: string, numero: string, serie: string): string {
  const hoje = new Date();
  const aamm = `${pad(hoje.getFullYear() % 100, 2)}${pad(hoje.getMonth() + 1, 2)}`;
  const cnpjDigitos = pad(somenteDigitos(cnpj), 14);
  const modelo = "55";
  const serieFmt = pad(serie, 3);
  const numeroFmt = pad(numero, 9);
  const tpEmis = "1";
  const codigoNumerico = pad(Math.floor(Math.random() * 1e8), 8);
  const semDv = `${uf}${aamm}${cnpjDigitos}${modelo}${serieFmt}${numeroFmt}${tpEmis}${codigoNumerico}`;
  const dv = calcularDvModulo11(semDv);
  return `${semDv}${dv}`;
}

function calcularDvModulo11(chave: string): string {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let pesoIdx = 0;
  for (let i = chave.length - 1; i >= 0; i--) {
    soma += Number(chave[i]) * pesos[pesoIdx % pesos.length];
    pesoIdx++;
  }
  const resto = soma % 11;
  const dv = 11 - resto;
  return String(dv >= 10 ? 0 : dv);
}

let contadorNumero = 4470;
function proximoNumero() {
  contadorNumero += 1;
  return String(contadorNumero);
}

export function escolherFornecedorAleatorio(): FornecedorFicticio {
  return FORNECEDORES[Math.floor(Math.random() * FORNECEDORES.length)];
}

/** Constrói a NF-e de entrada a partir de itens/quantidades já definidos — usado
 * tanto pelo seed (itens fixos) quanto pela simulação ao vivo (itens sorteados). */
export function construirNotaFiscalEntrada(
  itensComQtd: { item: Item; quantidade: number }[],
  fornecedor: FornecedorFicticio = escolherFornecedorAleatorio()
): NotaFiscal {
  const numero = proximoNumero();
  const serie = "1";

  const itensNota: ItemNotaFiscal[] = itensComQtd.map(({ item, quantidade }) => ({
    itemId: item.id,
    descricao: item.nome,
    ncm: NCM_POR_CATEGORIA[item.categoria] ?? "4819.20.00",
    cfop: "1102",
    quantidade,
    valorUnitario: item.valorUnitario,
  }));

  const valorTotal = itensNota.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);

  return {
    id: `nfe-${Date.now()}-${numero}`,
    tipo: "entrada",
    numero,
    serie,
    chaveAcesso: gerarChaveAcesso(fornecedor.uf, fornecedor.cnpj, numero, serie),
    dataEmissao: new Date().toISOString(),
    cnpjEmitente: fornecedor.cnpj,
    nomeEmitente: fornecedor.razaoSocial,
    cnpjDestinatario: DESTINATARIO_PADRAO.cnpj,
    nomeDestinatario: DESTINATARIO_PADRAO.nome,
    valorTotal,
    itens: itensNota,
  };
}

export function gerarNotaFiscalEntrada(itensCandidatos: Item[]): { nota: NotaFiscal; itensEscolhidos: { item: Item; quantidade: number }[] } {
  const qtdItens = Math.min(itensCandidatos.length, 2 + Math.floor(Math.random() * 2));
  const embaralhados = [...itensCandidatos].sort(() => Math.random() - 0.5).slice(0, qtdItens);

  const itensEscolhidos = embaralhados.map((item) => ({
    item,
    quantidade: Math.max(1, Math.round(5 + Math.random() * 25)),
  }));

  const nota = construirNotaFiscalEntrada(itensEscolhidos);
  return { nota, itensEscolhidos };
}

export function gerarNotaFiscalSaida(pedido: Pedido, itens: Item[], cliente: Cliente): NotaFiscal {
  const numero = proximoNumero();
  const serie = "2";

  const itensNota: ItemNotaFiscal[] = pedido.itens.map((linha) => {
    const item = itens.find((i) => i.id === linha.itemId);
    return {
      itemId: linha.itemId,
      descricao: item?.nome ?? linha.itemId,
      ncm: item ? (NCM_POR_CATEGORIA[item.categoria] ?? "4819.20.00") : "4819.20.00",
      cfop: "5102",
      quantidade: linha.quantidade,
      valorUnitario: item?.valorUnitario ?? 0,
    };
  });

  const valorTotal = itensNota.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);

  return {
    id: `nfe-${Date.now()}-${numero}`,
    tipo: "saida",
    numero,
    serie,
    chaveAcesso: gerarChaveAcesso("35", DESTINATARIO_PADRAO.cnpj, numero, serie),
    dataEmissao: new Date().toISOString(),
    cnpjEmitente: DESTINATARIO_PADRAO.cnpj,
    nomeEmitente: DESTINATARIO_PADRAO.nome,
    cnpjDestinatario: `00.000.000/0001-${String(10 + Math.floor(Math.random() * 80))}`,
    nomeDestinatario: cliente.nome,
    valorTotal,
    itens: itensNota,
  };
}

export function gerarXmlResumo(nf: NotaFiscal): string {
  const itensXml = nf.itens
    .map(
      (item, idx) => `    <det nItem="${idx + 1}">
      <prod>
        <cProd>${item.itemId ?? "S/COD"}</cProd>
        <xProd>${item.descricao}</xProd>
        <NCM>${item.ncm}</NCM>
        <CFOP>${item.cfop}</CFOP>
        <qCom>${item.quantidade}</qCom>
        <vUnCom>${item.valorUnitario.toFixed(2)}</vUnCom>
        <vProd>${(item.quantidade * item.valorUnitario).toFixed(2)}</vProd>
      </prod>
    </det>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00">
  <NFe>
    <infNFe Id="NFe${nf.chaveAcesso}" versao="4.00">
      <ide>
        <nNF>${nf.numero}</nNF>
        <serie>${nf.serie}</serie>
        <dhEmi>${nf.dataEmissao}</dhEmi>
        <tpNF>${nf.tipo === "entrada" ? "0" : "1"}</tpNF>
      </ide>
      <emit>
        <CNPJ>${somenteDigitos(nf.cnpjEmitente)}</CNPJ>
        <xNome>${nf.nomeEmitente}</xNome>
      </emit>
      <dest>
        <CNPJ>${somenteDigitos(nf.cnpjDestinatario)}</CNPJ>
        <xNome>${nf.nomeDestinatario}</xNome>
      </dest>
${itensXml}
      <total>
        <ICMSTot>
          <vNF>${nf.valorTotal.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <chNFe>${nf.chaveAcesso}</chNFe>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e (simulação)</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}
