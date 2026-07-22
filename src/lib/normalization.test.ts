import { describe, expect, it } from "vitest";
import { formatProtocol, normalizeEmail, normalizePhone, normalizeProtocol, sanitizePlainText } from "./normalization";

describe("normalização", () => {
  it("normaliza telefone e e-mail", () => {
    expect(normalizePhone("+55 (41) 99999-0000")).toBe("5541999990000");
    expect(normalizeEmail("  CLIENTE@Exemplo.COM.BR ")).toBe("cliente@exemplo.com.br");
  });

  it("formata protocolos com seis dígitos e mantém sequências distintas", () => {
    expect(formatProtocol(2026, 1)).toBe("MN-2026-000001");
    expect(new Set([formatProtocol(2026, 1), formatProtocol(2026, 2)]).size).toBe(2);
    expect(normalizeProtocol("mn2026000001")).toBe("MN-2026-000001");
  });

  it("remove controles de texto sem alterar acentos", () => {
    expect(sanitizePlainText("  Solicitação\u0000 válida  ")).toBe("Solicitação válida");
  });
});
