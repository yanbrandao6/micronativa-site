import { company } from "@/config/company";
import type { ServiceSlug } from "@/data/services";

export type WhatsAppContext = "home" | "solar" | "cftv" | "gate" | "access" | "integrated" | "maintenance" | "project" | "quote";
export interface WhatsAppMessageInput {
  context: WhatsAppContext; protocol?: string; city?: string; propertyType?: string;
  projectTitle?: string; service?: ServiceSlug | "projeto-integrado" | "manutencao";
}

const contextMessages: Record<Exclude<WhatsAppContext, "project" | "quote">, string> = {
  home: "Olá! Acessei o site da Micronativa e gostaria de receber informações sobre um projeto.",
  solar: "Olá! Acessei a página de Energia Solar da Micronativa e gostaria de solicitar uma avaliação para meu imóvel.",
  cftv: "Olá! Gostaria de receber informações sobre instalação de câmeras de segurança e monitoramento.",
  gate: "Olá! Gostaria de solicitar informações sobre automação ou manutenção de portão.",
  access: "Olá! Gostaria de receber informações sobre controle de acesso para meu imóvel.",
  integrated: "Olá! Gostaria de planejar um projeto integrado de energia, segurança e automação.",
  maintenance: "Olá! Gostaria de solicitar uma avaliação de manutenção.",
};

export function buildWhatsAppMessage(input: WhatsAppMessageInput) {
  if (input.context === "project") {
    return "Olá! Vi o projeto “" + (input.projectTitle ?? "estudo de caso") + "” no site da Micronativa e gostaria de solicitar uma solução semelhante.";
  }
  if (input.context === "quote") {
    const parts = ["Olá! Acabei de preencher uma solicitação no site da Micronativa."];
    if (input.protocol) parts.push("Protocolo: " + input.protocol);
    if (input.service) parts.push("Serviço: " + input.service.replaceAll("-", " "));
    if (input.propertyType) parts.push("Imóvel: " + input.propertyType);
    if (input.city) parts.push("Cidade: " + input.city);
    parts.push("Gostaria de continuar o atendimento pelo WhatsApp.");
    return parts.join("\n\n");
  }
  return contextMessages[input.context];
}

export function buildWhatsAppUrl(input: WhatsAppMessageInput) {
  return "https://wa.me/" + company.whatsapp + "?text=" + encodeURIComponent(buildWhatsAppMessage(input));
}
