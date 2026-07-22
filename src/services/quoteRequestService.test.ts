import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuoteRequest } from "@/features/quote-request/types/quoteRequest";
import { submitQuoteRequest } from "./quoteRequestService";

const request: QuoteRequest = {
  service: "energia-solar", additionalServices: [], propertyType: "Residência", purpose: "Nova instalação", city: "Curitiba", state: "PR",
  projectDetails: {}, attachments: [], customer: { name: "Cliente Teste", phone: "41999990000", whatsapp: "", email: "cliente@example.com" },
  preferredContactMethod: "WhatsApp", privacyConsent: true, sourcePage: "direct", website: "",
};

describe("idempotência no cliente", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("reenvia o mesmo token da sessão e aceita resposta duplicada segura", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ accepted: true, protocol: "MN-2026-000001", createdAt: "2026-07-22T10:00:00Z", service: "energia-solar", duplicate: true }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const token = "6f13fc50-3bf0-4a2d-b9c4-8c665a1bce61";
    await submitQuoteRequest(request, token);
    await submitQuoteRequest(request, token);
    const payloads = fetchMock.mock.calls.map((call) => JSON.parse(String((call[1]?.body as FormData).get("payload"))));
    expect(payloads.map((payload) => payload.idempotencyKey)).toEqual([token, token]);
  });
});
