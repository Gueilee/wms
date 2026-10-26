import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { responderPerguntaSimulada } from "@/lib/copilotoSimulado";

export const runtime = "nodejs";

interface Contexto {
  itens: {
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
  }[];
  alertas: { tipo: string; severidade: string; mensagem: string }[];
  pedidos: { numero: string; cliente: string; status: string }[];
  ocupacao: { total: number; ocupadas: number; bloqueadas: number; livres: number };
}

const SYSTEM_PROMPT = `Você é o GIRO, o assistente virtual do WMS Girou, atendendo a Braspel Embalagens (fabricante de embalagens de papel para food service).
Responda SEMPRE em português do Brasil, de forma direta, objetiva e simpática, como um analista de logística experiente falando com o gestor do armazém — sem se apresentar de novo a cada mensagem, apenas responda.
Use APENAS os dados fornecidos no contexto abaixo — são dados fictícios de uma demonstração comercial, nunca invente números que não estejam lá.
Quando fizer cálculos (somas, contagens, filtros), mostre o resultado já calculado, não a fórmula.
Se a pergunta não puder ser respondida com os dados fornecidos, diga isso claramente e sugira o que precisaria ser consultado.
Seja breve: 2 a 5 frases na maioria das respostas, use listas curtas quando houver múltiplos itens.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const body = await req.json();
  const pergunta: string = body.pergunta;
  const contexto: Contexto = body.contexto;
  const historico: { role: "user" | "assistant"; content: string }[] = body.historico ?? [];

  // Sem chave configurada (ambiente de demonstração pré-contrato): respondemos
  // com o motor de simulação local, sem nenhuma chamada paga à API da
  // Anthropic. Assim que ANTHROPIC_API_KEY existir, o bloco abaixo passa a
  // usar a Claude de verdade automaticamente — nenhuma mudança de front-end.
  if (!apiKey) {
    const reply = responderPerguntaSimulada(pergunta, contexto);
    return NextResponse.json({ reply });
  }

  const client = new Anthropic({ apiKey });

  const contextoResumo = JSON.stringify(contexto);

  try {
    const resposta = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: `${SYSTEM_PROMPT}\n\nCONTEXTO ATUAL DO ARMAZÉM (JSON):\n${contextoResumo}`,
      messages: [...historico, { role: "user", content: pergunta }],
    });

    const texto = resposta.content
      .filter((bloco) => bloco.type === "text")
      .map((bloco) => bloco.text)
      .join("\n");

    return NextResponse.json({ reply: texto || "Não consegui gerar uma resposta." });
  } catch (err) {
    console.error("Erro no copiloto:", err);
    return NextResponse.json(
      { reply: "Não foi possível consultar o copiloto agora. Tente novamente em instantes." },
      { status: 200 }
    );
  }
}
