import { company } from "@/config/company";
import type { ServiceSlug } from "@/data/services";

export type WhatsAppContext = "home" | "solar" | "cftv" | "gate" | "access" | "integrated" | "maintenance" | "project" | "quote";
export interface WhatsAppMessageInput {
  context: WhatsAppContext; protocol?: string; city?: string; propertyType?: string;
  projectTitle?: string; service?: ServiceSlug | "projeto-integrado" | "manutencao";
}

const contextMessages: Record<Exclude<WhatsAppContext, "project" | "quote">, string> = {
  home: "Ol?! Acessei o site da Micronativa e gostaria de receber informa??es sobre um projeto.",
  solar: "Ol?! Acessei a p?gina de Energia Solar da Micronativa e gostaria de solicitar uma avalia??o para meu im?vel.",
  cftv: "Ol?! Gostaria de receber informa??es sobre instala??o de c?meras de seguran?a e monitoramento.",
  gate: "Ol?! Gostaria de solicitar informa??es sobre automa??o ou manuten??o de port?o.",
  access: "Ol?! Gostaria de receber informa??es sobre controle de acesso para meu im?vel.",
  integrated: "Ol?! Gostaria de planejar um projeto integrado de energia, seguran?a e automa??o.",
  maintenance: "Ol?! Gostaria de solicitar uma avalia??o de manuten??o.",
};

export function buildWhatsAppMessage(input: WhatsAppMessageInput) {
  if (input.context === "project") {
    return "Ol?! Vi o projeto ?" + (input.projectTitle ?? "estudo de caso") + "? no site da Micronativa e gostaria de solicitar uma solu??o semelhante.";
  }
  if (input.context === "quote") {
    const parts = ["Ol?! Acabei de preencher uma solicita??o no site da Micronativa."];
    if (input.protocol) parts.push("Protocolo: " + input.protocol);
    if (input.service) parts.push("Servi?o: " + input.service.replaceAll("-", " "));
    if (input.propertyType) parts.push("Im?vel: " + input.propertyType);
    if (input.city) parts.push("Cidade: " + input.city);
    parts.push("Gostaria de continuar o atendimento pelo WhatsApp.");
    return parts.join("\n\n");
  }
  return contextMessages[input.context];
}

export function buildWhatsAppUrl(input: WhatsAppMessageInput) {
  return "https://wa.me/" + company.whatsapp + "?text=" + encodeURIComponent(buildWhatsAppMessage(input));
}
