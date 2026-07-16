import type {QuoteRequest} from "@/features/quote-request/types/quoteRequest";
export async function submitQuoteRequest(request:QuoteRequest){await new Promise(resolve=>setTimeout(resolve,850));if(!request.privacyConsent)throw new Error("O consentimento ? obrigat?rio.");return {accepted:true,storage:"mock" as const};}
// Integra??o futura: substitua por REST API, Server Action ou CRM.
// Valide novamente no servidor, adicione rate limiting, prote??o antispam,
// sanitiza??o e upload privado antes de persistir dados ou arquivos.
