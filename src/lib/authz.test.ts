import { describe, expect, it } from "vitest";
import { classifyAdminAccess, roleAllowed } from "./authz";

describe("autorização administrativa", () => {
  it("nega acesso sem sessão ou com usuário inativo", () => {
    expect(classifyAdminAccess(null, null)).toBe("unauthenticated");
    expect(classifyAdminAccess("user-1", { active: false, role: "administrador" })).toBe("forbidden");
  });

  it("autoriza usuário ativo e respeita papéis", () => {
    expect(classifyAdminAccess("user-1", { active: true, role: "comercial" })).toBe("authorized");
    expect(roleAllowed("administrador", ["administrador"])).toBe(true);
    expect(roleAllowed("tecnico", ["administrador"])).toBe(false);
  });
});
