import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const core = readFileSync(resolve(process.cwd(), "supabase/migrations/20260722055240_create_quote_request_platform.sql"), "utf8");
const security = readFileSync(resolve(process.cwd(), "supabase/migrations/20260722055243_configure_rls_and_storage.sql"), "utf8");

describe("garantias das migrações", () => {
  it("gera protocolos por identidade e trigger, sem contar linhas", () => {
    expect(core).toMatch(/generated always as identity/i);
    expect(core).toMatch(/new\.protocol := format/i);
    expect(core).toMatch(/protocol text not null unique/i);
    expect(core).not.toMatch(/count\s*\(\s*\*\s*\)[\s\S]*protocol/i);
  });

  it("registra status inicial e todas as mudanças", () => {
    expect(core).toContain("quote_requests_initial_status_after_insert");
    expect(core).toContain("quote_requests_status_after_update");
    expect(core).toContain("record_quote_status_change");
  });

  it("protege dados por RLS, revoga anon e mantém bucket privado", () => {
    expect(security.match(/enable row level security/g)?.length).toBeGreaterThanOrEqual(5);
    expect(security).toMatch(/revoke all on table public\.quote_requests from anon/i);
    expect(security).toMatch(/'quote-attachments'[\s\S]*false/i);
    expect(security).not.toMatch(/using\s*\(\s*true\s*\)/i);
  });

  it("impõe idempotência e máximo de seis anexos no banco", () => {
    expect(core).toMatch(/idempotency_key uuid not null unique/i);
    expect(core).toMatch(/attachment_index between 1 and 6/i);
    expect(core).toMatch(/unique \(quote_request_id, attachment_index\)/i);
  });
});
