"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { SelectField } from "@/components/forms/SelectField";
import { quoteStatusOrder, quoteStatuses } from "@/config/quoteStatuses";
import { quoteServiceOptions } from "@/config/quoteServices";

export type AdminFilterValues = { q: string; status: string; service: string; city: string; from: string; to: string; order: string };

export function AdminRequestFilters({ initial }: { initial: AdminFilterValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const set = (key: keyof AdminFilterValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
    router.push(`/admin/solicitacoes${params.size ? `?${params}` : ""}`);
  }

  return <form onSubmit={apply} className="rounded-3xl border bg-white p-5 shadow-sm">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="font-bold xl:col-span-2">Buscar<input className="input mt-2" value={values.q} onChange={(event) => set("q", event.target.value)} placeholder="Protocolo, cliente, e-mail ou telefone" /></label>
      <SelectField id="filter-status" label="Status" value={values.status} onValueChange={(value) => set("status", value)} placeholder="Todos os status" options={[{ value: "todos", label: "Todos os status" }, ...quoteStatusOrder.map((value) => ({ value, label: quoteStatuses[value].label }))]} />
      <SelectField id="filter-service" label="Serviço" value={values.service} onValueChange={(value) => set("service", value)} placeholder="Todos os serviços" options={[{ value: "todos", label: "Todos os serviços" }, ...quoteServiceOptions]} />
      <label className="font-bold">Cidade<input className="input mt-2" value={values.city} onChange={(event) => set("city", event.target.value)} placeholder="Ex.: Curitiba" /></label>
      <label className="font-bold">Data inicial<input className="input mt-2" type="date" value={values.from} onChange={(event) => set("from", event.target.value)} /></label>
      <label className="font-bold">Data final<input className="input mt-2" type="date" value={values.to} onChange={(event) => set("to", event.target.value)} /></label>
      <SelectField id="filter-order" label="Ordenação" value={values.order || "newest"} onValueChange={(value) => set("order", value)} options={[{ value: "newest", label: "Mais recentes" }, { value: "oldest", label: "Mais antigas" }]} />
    </div>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => { setValues({ q: "", status: "", service: "", city: "", from: "", to: "", order: "newest" }); router.push("/admin/solicitacoes"); }} className="btn-secondary"><RotateCcw className="size-4" />Limpar filtros</button><button className="btn-primary"><Search className="size-4" />Aplicar filtros</button></div>
  </form>;
}
