export type AnalyticsEvent =
  | "whatsapp_click" | "whatsapp_home_click" | "whatsapp_service_click" | "whatsapp_project_click"
  | "whatsapp_quote_completed_click" | "quote_form_started" | "quote_form_step_completed"
  | "quote_form_abandoned" | "quote_form_submitted" | "quote_whatsapp_clicked"
  | "project_viewed" | "project_filter_used" | "similar_project_clicked";

type SafeMetadata = Record<string, string | number | boolean | undefined>;

export function trackEvent(event: AnalyticsEvent, metadata: SafeMetadata = {}) {
  // Ponto ?nico de integra??o com GA, GTM, Meta Pixel ou outro provedor.
  // Nunca envie nomes, telefones, e-mails, mensagens ou nomes de arquivos.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("micronativa:analytics", { detail: { event, metadata } }));
  }
}
