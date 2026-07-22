import type { QuoteRequest, QuoteSubmissionResult } from "@/features/quote-request/types/quoteRequest";

export async function submitQuoteRequest(request: QuoteRequest, idempotencyKey: string): Promise<QuoteSubmissionResult> {
  const payload = {
    ...request,
    attachments: undefined,
    idempotencyKey,
    website: request.website ?? "",
  };
  const body = new FormData();
  body.set("payload", JSON.stringify(payload));
  request.attachments.forEach((attachment) => body.append("attachments", attachment.file, attachment.name));

  const response = await fetch("/api/quote-requests", { method: "POST", body, headers: { Accept: "application/json" } });
  const result = await response.json().catch(() => null) as QuoteSubmissionResult | { error?: string } | null;
  if (!response.ok || !result || !("accepted" in result)) {
    throw new Error(result && "error" in result && result.error ? result.error : "Não foi possível enviar a solicitação.");
  }
  return result;
}
