import type { ClasseAbc, StatusLocalizacao, StatusPedido } from "@/types";

export const COR_CLASSE_ABC: Record<ClasseAbc, string> = {
  A: "var(--color-status-ok)",
  B: "var(--color-status-info)",
  C: "var(--color-text-faint)",
};

export const LABEL_STATUS_LOCALIZACAO: Record<StatusLocalizacao, string> = {
  livre: "Livre",
  ocupado: "Ocupado",
  bloqueado: "Bloqueado",
};

export const LABEL_STATUS_PEDIDO: Record<StatusPedido, string> = {
  aberto: "Aberto",
  separando: "Separando",
  separado: "Separado",
  embalado: "Embalado",
  expedido: "Expedido",
};

export const LABEL_MODELO_ARTE = {
  liso: "Liso",
  padrao_braspel: "Padrão Braspel",
  personalizado: "Personalizado",
} as const;
