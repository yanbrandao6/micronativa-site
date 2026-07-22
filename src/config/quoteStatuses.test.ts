import { describe, expect, it } from "vitest";
import { allowedStatusTransitions, quoteStatusOrder, quoteStatuses } from "./quoteStatuses";

describe("status das solicitações", () => {
  it("mantém configuração completa, ordenada e com mensagens públicas", () => {
    expect(quoteStatusOrder).toHaveLength(9);
    quoteStatusOrder.forEach((status) => expect(quoteStatuses[status].publicMessage.length).toBeGreaterThan(5));
  });

  it("bloqueia saltos inválidos no fluxo", () => {
    expect(allowedStatusTransitions.recebido).toContain("em_analise");
    expect(allowedStatusTransitions.recebido).not.toContain("concluido");
    expect(allowedStatusTransitions.em_execucao).toContain("concluido");
  });
});
