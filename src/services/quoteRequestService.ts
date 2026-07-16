import type {QuoteRequest} from "@/features/quote-request/types/quoteRequest";
export async function submitQuoteRequest(request:QuoteRequest){await new Promise(resolve=>setTimeout(resolve,850));if(!request.privacyConsent)throw new Error("O consentimento é obrigatório.");return {accepted:true,storage:"mock" as const};}
// Integração futura: substitua por REST API, Server Action ou CRM.
// Valide novamente no servidor, adicione rate limiting, proteção antispam,
// sanitização e upload privado antes de persistir dados ou arquivos.
