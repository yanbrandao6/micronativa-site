"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ClipboardList, LoaderCircle, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { quoteStatuses } from "@/config/quoteStatuses";
import { normalizeProtocol } from "@/lib/normalization";
import type { PublicQuoteLookupResult } from "@/lib/publicQuoteLookup";

const serviceLabels: Record<string, string> = {
  "energia-solar": "Energia Solar",
  "cftv-seguranca": "CFTV e Monitoramento",
  "automacao-portoes": "Automação de Portões",
  "controle-acesso": "Controle de Acesso",
  "projeto-integrado": "Projeto Integrado",
  manutencao: "Manutenção",
};

export function ProtocolLookupForm({ initialProtocol = "" }: { initialProtocol?: string }) {
  const [protocol, setProtocol] = useState(normalizeProtocol(initialProtocol));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicQuoteLookupResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") resultRef.current?.focus();
  }, [status]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);
    const response = await fetch("/api/protocol-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ protocol, email }),
    });
    const body = await response.json().catch(() => null) as PublicQuoteLookupResult | { error?: string } | null;
    if (!response.ok || !body || !("timeline" in body)) {
      setError(body && "error" in body && body.error ? body.error : "Não foi possível localizar uma solicitação com os dados informados.");
      setStatus("error");
      return;
    }
    setResult(body);
    setStatus("success");
  }

  return <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
    <form onSubmit={submit} className="card h-fit p-6 sm:p-8" noValidate>
      <h2 className="text-2xl font-bold">Dados para consulta</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Use exatamente o e-mail informado no envio. Os dois dados são obrigatórios.</p>
      <label htmlFor="protocol" className="mt-6 block font-bold">Protocolo</label>
      <input id="protocol" className="input mt-2 uppercase" value={protocol} onChange={(event) => setProtocol(normalizeProtocol(event.target.value))} placeholder="MN-2026-000001" autoCapitalize="characters" autoComplete="off" inputMode="text" required />
      <label htmlFor="lookup-email" className="mt-5 block font-bold">E-mail utilizado na solicitação</label>
      <input id="lookup-email" className="input mt-2" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com.br" autoComplete="email" inputMode="email" type="email" required />
      {status === "error" && <p role="alert" className="mt-4 flex gap-2 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</p>}
      <button className="btn-primary mt-6 w-full" disabled={status === "loading"}>
        {status === "loading" ? <><LoaderCircle className="size-4 animate-spin" />Consultando</> : <><Search className="size-4" />Consultar protocolo</>}
      </button>
    </form>

    <div aria-live="polite">
      {!result && status !== "loading" && <div className="card grid min-h-80 place-items-center p-8 text-center">
        <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest-pale text-forest"><ClipboardList className="size-7" /></span><h2 className="mt-5 text-xl font-bold">Acompanhe cada atualização</h2><p className="mx-auto mt-2 max-w-md leading-7 text-muted">O andamento e as mensagens públicas da equipe aparecerão aqui. Dados internos e anexos nunca são exibidos nesta consulta.</p></div>
      </div>}
      {status === "loading" && <div className="card min-h-80 animate-pulse space-y-5 p-8" aria-label="Carregando solicitação"><div className="h-8 w-2/3 rounded bg-navy/10" /><div className="h-24 rounded-2xl bg-navy/5" /><div className="h-16 rounded-2xl bg-navy/5" /><div className="h-16 rounded-2xl bg-navy/5" /></div>}
      {result && <div ref={resultRef} tabIndex={-1} className="card p-6 focus:outline-none sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-muted">Protocolo</p><h2 className="mt-1 text-2xl font-extrabold text-navy">{result.protocol}</h2></div><StatusBadge status={result.status} /></div>
        <dl className="mt-7 grid gap-4 rounded-2xl bg-warm p-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Serviço</dt><dd className="mt-1 font-bold">{serviceLabels[result.service] ?? result.service}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Enviada em</dt><dd className="mt-1 font-bold">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(result.submittedAt))}</dd></div></dl>
        <h3 className="mt-8 text-lg font-bold">Histórico público</h3>
        <ol className="mt-5 space-y-4">{result.timeline.map((event, index) => <li key={`${event.createdAt}-${index}`} className="relative flex gap-4"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-forest text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1 rounded-2xl border bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{quoteStatuses[event.status].label}</strong><time className="text-xs text-muted">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(event.createdAt))}</time></div><p className="mt-2 text-sm leading-6 text-muted">{event.message}</p></div></li>)}</ol>
      </div>}
    </div>
  </div>;
}
