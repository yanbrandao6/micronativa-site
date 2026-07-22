import type { QuoteService } from "@/features/quote-request/types/quoteRequest";

export const quoteServiceLabels: Record<QuoteService, string> = {
  "energia-solar": "Energia Solar",
  "cftv-seguranca": "CFTV e Monitoramento",
  "automacao-portoes": "Automação de Portões",
  "controle-acesso": "Controle de Acesso",
  "projeto-integrado": "Projeto Integrado",
  manutencao: "Manutenção",
};

export const quoteServiceOptions = Object.entries(quoteServiceLabels).map(([value, label]) => ({ value, label }));
