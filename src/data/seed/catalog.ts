import type { CategoriaItem, Cliche, Item, ModeloArte, UnidadeMedida } from "@/types";
import { CLIENTES } from "./clients";
import { mulberry32, pick, randInt } from "./rng";

const rand = mulberry32(911984);

const COR_CATEGORIA: Record<CategoriaItem, string> = {
  "Caixa Delivery": "#c8793a",
  "Caixa Selada": "#b8905b",
  Sacola: "#8b5e3c",
  Saco: "#a9825a",
  "Copo de Papel": "#e3c99a",
  Bobina: "#6b4f3a",
  Adesivo: "#d1b35a",
  "Papel Acoplado": "#9c8465",
  "Toalha Americana": "#c9b38b",
  Ferramental: "#64748b",
};

const ARTES_PADRAO = ["Bom Apetite", "Menu", "Oba"] as const;

let seq = 1000;
function nextCodigo() {
  seq += 1;
  return String(seq);
}

interface Rascunho {
  nome: string;
  categoria: CategoriaItem;
  modeloArte: ModeloArte;
  clienteId?: string;
  material: string;
  gramatura?: string;
  cor?: string;
  dimensoes?: string;
  unidadeMedida: UnidadeMedida;
  unidadesPorPacote?: number;
  faixaSaldo: [number, number];
  faixaValor: [number, number];
  loteValidadeControlado: boolean;
}

const rascunhos: Rascunho[] = [];

const SUBTIPOS_DELIVERY = [
  { nome: "Caixa Fritas", dimensoes: "9x9x6cm" },
  { nome: "Caixa Hambúrguer", dimensoes: "11x11x8cm" },
  { nome: "Caixa Hot Dog", dimensoes: "18x8x6cm" },
  { nome: "Caixa Pastel", dimensoes: "16x12x5cm" },
  { nome: "Caixa Churros", dimensoes: "14x8x6cm" },
  { nome: "Caixa Pipoca", dimensoes: "12x12x14cm" },
  { nome: "Caixa Combo", dimensoes: "20x14x8cm" },
  { nome: "Caixa Canoa", dimensoes: "16x7x5cm" },
  { nome: "Caixa Cone", dimensoes: "10x10x16cm" },
  { nome: "Caixa Porções", dimensoes: "15x10x6cm" },
];

for (const sub of SUBTIPOS_DELIVERY) {
  rascunhos.push({
    nome: `${sub.nome} Liso Kraft`,
    categoria: "Caixa Delivery",
    modeloArte: "liso",
    material: "Papel Kraft",
    gramatura: "250 g/m²",
    dimensoes: sub.dimensoes,
    unidadeMedida: "pacote",
    unidadesPorPacote: 100,
    faixaSaldo: [40, 420],
    faixaValor: [22, 48],
    loteValidadeControlado: false,
  });
  for (const arte of ARTES_PADRAO.slice(0, 2)) {
    rascunhos.push({
      nome: `${sub.nome} Arte Braspel ${arte}`,
      categoria: "Caixa Delivery",
      modeloArte: "padrao_braspel",
      material: "Papel Kraft",
      gramatura: "250 g/m²",
      dimensoes: sub.dimensoes,
      unidadeMedida: "pacote",
      unidadesPorPacote: 100,
      faixaSaldo: [30, 350],
      faixaValor: [24, 50],
      loteValidadeControlado: false,
    });
  }
  const clientesSub = [pick(rand, CLIENTES), pick(rand, CLIENTES)];
  for (const cli of clientesSub) {
    rascunhos.push({
      nome: `${sub.nome} Personalizada`,
      categoria: "Caixa Delivery",
      modeloArte: "personalizado",
      clienteId: cli.id,
      material: "Papel Kraft",
      gramatura: "250 g/m²",
      dimensoes: sub.dimensoes,
      unidadeMedida: "pacote",
      unidadesPorPacote: 100,
      faixaSaldo: [10, 140],
      faixaValor: [26, 55],
      loteValidadeControlado: false,
    });
  }
}

for (const sub of ["Caixa Selada Comum", "Caixa Bandeja Selada"]) {
  for (const modelo of ["liso", "padrao_braspel", "personalizado"] as ModeloArte[]) {
    rascunhos.push({
      nome: `${sub}${modelo === "liso" ? " Liso Branco" : modelo === "padrao_braspel" ? " Arte Braspel" : " Personalizada"}`,
      categoria: "Caixa Selada",
      modeloArte: modelo,
      clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
      material: "Papel Cartão",
      gramatura: "300 g/m²",
      dimensoes: "22x16x7cm",
      unidadeMedida: "pacote",
      unidadesPorPacote: 50,
      faixaSaldo: [20, 180],
      faixaValor: [30, 60],
      loteValidadeControlado: false,
    });
  }
}

for (const formato of ["Maleta", "Oval", "Retangular"]) {
  for (const modelo of ["liso", "padrao_braspel", "personalizado"] as ModeloArte[]) {
    rascunhos.push({
      nome: `Caixa Presente ${formato}${modelo === "padrao_braspel" ? " Arte Braspel" : modelo === "personalizado" ? " Personalizada" : " Liso"}`,
      categoria: "Caixa Delivery",
      modeloArte: modelo,
      clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
      material: "Papel Cartão",
      dimensoes: formato === "Maleta" ? "24x18x10cm" : "20x20x10cm",
      unidadeMedida: "pacote",
      unidadesPorPacote: 25,
      faixaSaldo: [8, 90],
      faixaValor: [35, 70],
      loteValidadeControlado: false,
    });
  }
}

const TAMANHOS_SACOLA = ["N.1/31", "N.2/14.5", "N.4/19", "N.6/25"];
for (const tam of TAMANHOS_SACOLA) {
  for (const modelo of ["liso", "padrao_braspel", "personalizado"] as ModeloArte[]) {
    rascunhos.push({
      nome: `Sacola ${tam}${modelo === "padrao_braspel" ? " Arte Braspel" : modelo === "personalizado" ? " Personalizada" : " Lisa"}`,
      categoria: "Sacola",
      modeloArte: modelo,
      clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
      material: "Kraft Pardo",
      gramatura: "80 g/m²",
      unidadeMedida: "pacote",
      unidadesPorPacote: 250,
      faixaSaldo: [20, 300],
      faixaValor: [14, 32],
      loteValidadeControlado: false,
    });
  }
}

const TAMANHOS_SACO = ["N.1/26", "N.1/31", "N.3.5/19"];
for (const tam of TAMANHOS_SACO) {
  for (const modelo of ["liso", "padrao_braspel", "personalizado"] as ModeloArte[]) {
    rascunhos.push({
      nome: `Saco ${tam}${modelo === "padrao_braspel" ? " Arte Braspel" : modelo === "personalizado" ? " Personalizado" : " Liso"}`,
      categoria: "Saco",
      modeloArte: modelo,
      clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
      material: "Kraft Pardo",
      gramatura: "80 g/m²",
      unidadeMedida: "pacote",
      unidadesPorPacote: 250,
      faixaSaldo: [20, 280],
      faixaValor: [12, 28],
      loteValidadeControlado: false,
    });
  }
}

const TAMANHOS_COPO = ["180ml", "300ml", "500ml"];
for (const tam of TAMANHOS_COPO) {
  for (const comTampa of [false, true]) {
    for (const modelo of ["liso", "personalizado"] as ModeloArte[]) {
      rascunhos.push({
        nome: `Copo de Papel ${tam}${comTampa ? " com Tampa" : ""}${modelo === "personalizado" ? " Personalizado" : " Liso Branco"}`,
        categoria: "Copo de Papel",
        modeloArte: modelo,
        clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
        material: "Papel Biodegradável",
        unidadeMedida: "pacote",
        unidadesPorPacote: 50,
        faixaSaldo: [15, 260],
        faixaValor: [9, 22],
        loteValidadeControlado: false,
      });
    }
  }
}

const BOBINAS: { nome: string; material: string; gramatura: string }[] = [
  { nome: "Bobina Kraft Pardo", material: "Kraft Pardo", gramatura: "80 g/m²" },
  { nome: "Bobina Branca", material: "Papel Branco", gramatura: "50 g/m²" },
  { nome: "Bobina Barreira de Gordura", material: "Papel Barreira", gramatura: "40 g/m²" },
];
for (const bob of BOBINAS) {
  for (const largura of ["40cm", "60cm", "80cm"]) {
    rascunhos.push({
      nome: `${bob.nome} ${largura}`,
      categoria: "Bobina",
      modeloArte: "liso",
      material: bob.material,
      gramatura: bob.gramatura,
      dimensoes: largura,
      unidadeMedida: "bobina",
      faixaSaldo: [4, 48],
      faixaValor: [180, 420],
      loteValidadeControlado: true,
    });
  }
}

for (const acabamento of ["Brilho", "Fosco"]) {
  for (const modelo of ["liso", "personalizado"] as ModeloArte[]) {
    rascunhos.push({
      nome: `Adesivo ${acabamento}${modelo === "personalizado" ? " Personalizado" : ""}`,
      categoria: "Adesivo",
      modeloArte: modelo,
      clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
      material: "Papel Couché",
      unidadeMedida: "pacote",
      unidadesPorPacote: 500,
      faixaSaldo: [10, 120],
      faixaValor: [8, 18],
      loteValidadeControlado: false,
    });
  }
}

for (const gram of ["90 g/m²", "120 g/m²"]) {
  rascunhos.push({
    nome: `Papel Acoplado ${gram}`,
    categoria: "Papel Acoplado",
    modeloArte: "liso",
    material: "Papel Acoplado",
    gramatura: gram,
    unidadeMedida: "bobina",
    faixaSaldo: [3, 30],
    faixaValor: [140, 260],
    loteValidadeControlado: true,
  });
}

for (const modelo of ["liso", "personalizado"] as ModeloArte[]) {
  rascunhos.push({
    nome: `Toalha Americana${modelo === "personalizado" ? " Personalizada" : " Lisa"}`,
    categoria: "Toalha Americana",
    modeloArte: modelo,
    clienteId: modelo === "personalizado" ? pick(rand, CLIENTES).id : undefined,
    material: "Papel Kraft",
    unidadeMedida: "pacote",
    unidadesPorPacote: 1000,
    faixaSaldo: [8, 90],
    faixaValor: [45, 85],
    loteValidadeControlado: false,
  });
}

function construirItens(): Item[] {
  return rascunhos.map((r) => {
    const saldoDisponivel = randInt(rand, r.faixaSaldo[0], r.faixaSaldo[1]);
    const estoqueMinimo = Math.round(saldoDisponivel * 0.18 + randInt(rand, 2, 10));
    const estoqueMaximo = Math.round(saldoDisponivel * 1.6 + estoqueMinimo);
    const valorUnitario = Number(
      (r.faixaValor[0] + rand() * (r.faixaValor[1] - r.faixaValor[0])).toFixed(2)
    );
    return {
      id: `item-${nextCodigo()}`,
      codigo: seq.toString(),
      nome: r.nome,
      categoria: r.categoria,
      modeloArte: r.modeloArte,
      clienteId: r.clienteId,
      material: r.material,
      gramatura: r.gramatura,
      cor: r.cor,
      dimensoes: r.dimensoes,
      unidadeMedida: r.unidadeMedida,
      unidadesPorPacote: r.unidadesPorPacote,
      saldoDisponivel,
      saldoReservado: randInt(rand, 0, Math.round(saldoDisponivel * 0.15)),
      estoqueMinimo,
      estoqueMaximo,
      classeAbc: "C",
      valorUnitario,
      loteValidadeControlado: r.loteValidadeControlado,
      imagemCor: COR_CATEGORIA[r.categoria],
    } satisfies Item;
  });
}

function construirFerramental(itens: Item[]): { facas: Item[]; cliches: Cliche[] } {
  const facas: Item[] = [
    "Faca de Corte Caixa Delivery",
    "Faca de Corte Sacola",
    "Faca de Corte Copo",
    "Faca de Corte Caixa Presente",
    "Faca de Corte Toalha Americana",
  ].map((nome) => ({
    id: `item-${nextCodigo()}`,
    codigo: seq.toString(),
    nome,
    categoria: "Ferramental" as CategoriaItem,
    modeloArte: "liso" as ModeloArte,
    material: "Aço/Borracha",
    unidadeMedida: "unidade" as UnidadeMedida,
    saldoDisponivel: 1,
    saldoReservado: 0,
    estoqueMinimo: 1,
    estoqueMaximo: 1,
    classeAbc: "C" as const,
    valorUnitario: randInt(rand, 600, 1400),
    loteValidadeControlado: false,
    imagemCor: COR_CATEGORIA.Ferramental,
  }));

  const personalizados = itens.filter((i) => i.modeloArte === "personalizado");
  const porCliente = new Map<string, Item[]>();
  for (const item of personalizados) {
    const lista = porCliente.get(item.clienteId!) ?? [];
    lista.push(item);
    porCliente.set(item.clienteId!, lista);
  }

  const cliches: Cliche[] = [];
  let i = 0;
  for (const [clienteId, lista] of porCliente) {
    // Agrupa itens do mesmo cliente em lotes de até 3 por clichê — um clichê
    // de impressão é reutilizado entre variações próximas da mesma arte.
    for (let start = 0; start < lista.length; start += 3) {
      const grupo = lista.slice(start, start + 3);
      i += 1;
      cliches.push({
        id: `cliche-${i}`,
        clienteId,
        arteDescricao: `Arte exclusiva — ${grupo[0].nome.replace(" Personalizada", "").replace(" Personalizado", "")}`,
        itemIds: grupo.map((g) => g.id),
        status: "ativo",
        localizacaoGuarda: "Armário de Ferramental — Sala de Clichês",
        ultimoUso: "",
      });
    }
  }

  return { facas, cliches };
}

const itensBase = construirItens();
const { facas, cliches } = construirFerramental(itensBase);

function classificarAbc(itens: Item[]): Item[] {
  const comValor = itens.map((item) => ({
    item,
    valorTotal: item.saldoDisponivel * item.valorUnitario,
  }));
  comValor.sort((a, b) => b.valorTotal - a.valorTotal);
  const valorGeral = comValor.reduce((acc, c) => acc + c.valorTotal, 0) || 1;
  let acumulado = 0;
  for (const c of comValor) {
    acumulado += c.valorTotal;
    const pct = acumulado / valorGeral;
    c.item.classeAbc = pct <= 0.8 ? "A" : pct <= 0.95 ? "B" : "C";
  }
  return itens;
}

export const ITENS: Item[] = classificarAbc([...itensBase, ...facas]);
export const CLICHES: Cliche[] = cliches;
