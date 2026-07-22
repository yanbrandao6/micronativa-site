import { describe, expect, it } from "vitest";
import { buildPublicQuoteLookupResult } from "./publicQuoteLookup";

describe("consulta pública", () => {
  it("retorna somente os campos públicos permitidos", () => {
    const result = buildPublicQuoteLookupResult(
      { protocol: "MN-2026-000001", service: "energia-solar", created_at: "2026-07-22T10:00:00Z", status: "recebido", updated_at: "2026-07-22T10:00:00Z" },
      [{ new_status: "recebido", public_message: "Recebemos sua solicitação.", created_at: "2026-07-22T10:00:00Z" }],
    );
    expect(result.protocol).toBe("MN-2026-000001");
    expect(result.timeline).toHaveLength(1);
    expect(result).not.toHaveProperty("customer_email");
    expect(result).not.toHaveProperty("customer_phone");
    expect(result).not.toHaveProperty("attachments");
    expect(result).not.toHaveProperty("notes");
    expect(JSON.stringify(result)).not.toContain("quote_request_id");
  });
});
