import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectField } from "./SelectField";

describe("SelectField", () => {
  it("permite selecionar uma opção somente com o teclado", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<SelectField id="state" label="Estado" value="" onValueChange={change} options={[{ value: "PR", label: "Paraná" }, { value: "SC", label: "Santa Catarina" }]} />);
    const trigger = screen.getByRole("combobox", { name: "Estado" });
    trigger.focus();
    await user.keyboard("{Enter}{ArrowDown}{Enter}");
    expect(change).toHaveBeenCalledWith(expect.stringMatching(/PR|SC/));
  });

  it("associa mensagem de erro ao campo", () => {
    render(<SelectField id="purpose" label="Finalidade" value="" onValueChange={() => undefined} options={[]} error="Selecione uma finalidade." />);
    expect(screen.getByRole("combobox", { name: "Finalidade" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione uma finalidade.");
  });
});
