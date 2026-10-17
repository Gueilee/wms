import type { Cliente } from "@/types";

// Clientes fictícios, mas consistentes com o segmento real que a Braspel
// atende (food service: hamburgueria, pastelaria, hot dog, doceria, etc.).
export const CLIENTES: Cliente[] = [
  { id: "cli-01", nome: "Hamburgueria do Zé", segmento: "Hamburgueria" },
  { id: "cli-02", nome: "Pastelaria Dona Rosa", segmento: "Pastelaria" },
  { id: "cli-03", nome: "Point do Hot Dog", segmento: "Hot Dog" },
  { id: "cli-04", nome: "Doceria Flor de Mel", segmento: "Doceria" },
  { id: "cli-05", nome: "Pizzaria Napoli Express", segmento: "Pizzaria" },
  { id: "cli-06", nome: "Lanchonete Sabor Caseiro", segmento: "Lanchonete" },
  { id: "cli-07", nome: "Cantina Dalla Nonna", segmento: "Restaurante" },
  { id: "cli-08", nome: "Rede Burguer House", segmento: "Hamburgueria" },
];
