import { describe, expect, it } from "vitest";
import { MAX_ATTACHMENT_SIZE, quoteRequestPayloadSchema, validateAttachment } from "./quoteRequest";

const validPayload = {
  idempotencyKey: "6f13fc50-3bf0-4a2d-b9c4-8c665a1bce61",
  service: "energia-solar",
  additionalServices: [],
  propertyType: "Residência",
  purpose: "Nova instalação",
  city: "Curitiba",
  state: "PR",
  projectDetails: { electricalConnection: "Trifásica" },
  customer: { name: "Cliente Teste", phone: "(41) 99999-0000", whatsapp: "", email: "CLIENTE@EXEMPLO.COM" },
  preferredContactMethod: "WhatsApp",
  privacyConsent: true,
  sourcePage: "direct",
  website: "",
};

describe("validação do formulário", () => {
  it("normaliza e aceita uma solicitação válida", () => {
    const result = quoteRequestPayloadSchema.parse(validPayload);
    expect(result.customer.phone).toBe("41999990000");
    expect(result.customer.email).toBe("cliente@exemplo.com");
  });

  it("rejeita ausência de consentimento, HTML e estado fora do Paraná", () => {
    expect(quoteRequestPayloadSchema.safeParse({ ...validPayload, privacyConsent: false }).success).toBe(false);
    expect(quoteRequestPayloadSchema.safeParse({ ...validPayload, city: "<b>Curitiba</b>" }).success).toBe(false);
    expect(quoteRequestPayloadSchema.safeParse({ ...validPayload, state: "SC" }).success).toBe(false);
  });
});

describe("validação de anexos", () => {
  it("aceita extensão e MIME correspondentes", () => {
    expect(validateAttachment({ name: "projeto.jpeg", type: "image/jpeg", size: 1024 })).toEqual({ valid: true, extension: "jpeg" });
  });

  it("rejeita extensão falsa, MIME inválido e arquivo maior que 8 MB", () => {
    expect(validateAttachment({ name: "arquivo.pdf", type: "image/jpeg", size: 1024 }).valid).toBe(false);
    expect(validateAttachment({ name: "arquivo.exe", type: "application/octet-stream", size: 1024 }).valid).toBe(false);
    expect(validateAttachment({ name: "arquivo.png", type: "image/png", size: MAX_ATTACHMENT_SIZE + 1 }).valid).toBe(false);
  });
});
