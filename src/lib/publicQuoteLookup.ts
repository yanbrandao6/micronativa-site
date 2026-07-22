import type { QuoteRequestStatus } from "@/config/quoteStatuses";

export interface PublicStatusEvent {
  status: QuoteRequestStatus;
  message: string;
  createdAt: string;
}

export interface PublicQuoteLookupResult {
  protocol: string;
  service: string;
  submittedAt: string;
  status: QuoteRequestStatus;
  updatedAt: string;
  timeline: PublicStatusEvent[];
}

export function buildPublicQuoteLookupResult(
  request: { protocol: string; service: string; created_at: string; status: QuoteRequestStatus; updated_at: string },
  history: Array<{ new_status: QuoteRequestStatus; public_message: string; created_at: string }>,
): PublicQuoteLookupResult {
  return {
    protocol: request.protocol,
    service: request.service,
    submittedAt: request.created_at,
    status: request.status,
    updatedAt: request.updated_at,
    timeline: history.map((event) => ({ status: event.new_status, message: event.public_message, createdAt: event.created_at })),
  };
}
