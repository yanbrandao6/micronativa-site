import type { Enums } from "@/types/database";

export type QuoteRequestStatus = Enums<"quote_request_status">;
export type AdminRole = Enums<"admin_role">;

export const quoteStatusOrder: QuoteRequestStatus[] = [
  "recebido", "em_analise", "contato_realizado", "aguardando_cliente",
  "visita_agendada", "proposta_enviada", "em_execucao", "concluido", "cancelado",
];

export const quoteStatuses: Record<QuoteRequestStatus, { label: string; badgeClass: string; publicMessage: string }> = {
  recebido: { label: "Recebido", badgeClass: "bg-blue-50 text-blue-800", publicMessage: "Recebemos sua solicitação." },
  em_analise: { label: "Em análise", badgeClass: "bg-amber-50 text-amber-900", publicMessage: "A solicitação está sendo analisada pela equipe." },
  contato_realizado: { label: "Contato realizado", badgeClass: "bg-cyan-50 text-cyan-900", publicMessage: "Nossa equipe realizou uma tentativa de contato." },
  aguardando_cliente: { label: "Aguardando cliente", badgeClass: "bg-orange-50 text-orange-900", publicMessage: "A solicitação aguarda um retorno do cliente." },
  visita_agendada: { label: "Visita agendada", badgeClass: "bg-violet-50 text-violet-900", publicMessage: "Uma visita técnica foi agendada." },
  proposta_enviada: { label: "Proposta enviada", badgeClass: "bg-indigo-50 text-indigo-900", publicMessage: "A proposta foi preparada." },
  em_execucao: { label: "Em execução", badgeClass: "bg-forest-pale text-forest-dark", publicMessage: "O serviço está em execução." },
  concluido: { label: "Concluído", badgeClass: "bg-emerald-50 text-emerald-900", publicMessage: "O serviço foi concluído." },
  cancelado: { label: "Cancelado", badgeClass: "bg-red-50 text-red-800", publicMessage: "A solicitação foi cancelada." },
};

export const allowedStatusTransitions: Record<QuoteRequestStatus, QuoteRequestStatus[]> = {
  recebido: ["em_analise", "cancelado"],
  em_analise: ["contato_realizado", "aguardando_cliente", "visita_agendada", "proposta_enviada", "cancelado"],
  contato_realizado: ["em_analise", "aguardando_cliente", "visita_agendada", "proposta_enviada", "cancelado"],
  aguardando_cliente: ["contato_realizado", "visita_agendada", "proposta_enviada", "cancelado"],
  visita_agendada: ["em_analise", "aguardando_cliente", "proposta_enviada", "cancelado"],
  proposta_enviada: ["aguardando_cliente", "em_execucao", "cancelado"],
  em_execucao: ["concluido", "cancelado"],
  concluido: [],
  cancelado: ["recebido"],
};

export const adminRoleLabels: Record<AdminRole, string> = {
  administrador: "Administrador",
  comercial: "Comercial",
  tecnico: "Técnico",
};
