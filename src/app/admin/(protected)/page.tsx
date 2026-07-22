import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Eye, FileCheck2, HardHat, SearchCheck } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { quoteServiceLabels } from "@/config/quoteServices";
import { formatDateTime } from "@/lib/formatters";
import type { QuoteService } from "@/features/quote-request/types/quoteRequest";
import type { QuoteRequestStatus } from "@/config/quoteStatuses";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visão geral | Administração Micronativa" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const count = (status: QuoteRequestStatus) => supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", status).is("archived_at", null);
  const [received, analysis, visits, proposals, execution, completed, recent] = await Promise.all([
    count("recebido"), count("em_analise"), count("visita_agendada"), count("proposta_enviada"), count("em_execucao"), count("concluido"),
    supabase.from("quote_requests").select("id, protocol, customer_name, service, city, status, created_at").is("archived_at", null).order("created_at", { ascending: false }).limit(7),
  ]);
  const cards = [
    [ClipboardList, "Novas solicitações", received.count ?? 0], [SearchCheck, "Em análise", analysis.count ?? 0],
    [Eye, "Visitas agendadas", visits.count ?? 0], [FileCheck2, "Propostas enviadas", proposals.count ?? 0],
    [HardHat, "Em execução", execution.count ?? 0], [CheckCircle2, "Concluídas", completed.count ?? 0],
  ] as const;

  return <><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Administração</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Visão geral</h1><p className="mt-2 text-muted">Acompanhe o fluxo comercial e técnico sem carregar todos os registros no navegador.</p></div><Link href="/admin/solicitacoes" className="btn-primary">Ver solicitações <ArrowRight className="size-4" /></Link></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{cards.map(([Icon, label, value]) => <article key={label} className="rounded-3xl border bg-white p-5 shadow-sm"><span className="grid size-11 place-items-center rounded-2xl bg-forest-pale text-forest"><Icon className="size-5" /></span><p className="mt-5 text-3xl font-extrabold text-navy">{value}</p><h2 className="mt-1 text-sm font-bold text-muted">{label}</h2></article>)}</section>
    <section className="mt-8 rounded-3xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Solicitações recentes</h2><p className="mt-1 text-sm text-muted">Últimos registros concluídos no formulário.</p></div><Link href="/admin/solicitacoes" className="text-sm font-bold text-forest hover:underline">Ver todas</Link></div>
      <div className="mt-6 space-y-3">{recent.data?.length ? recent.data.map((item) => <Link key={item.id} href={`/admin/solicitacoes/${item.id}`} className="flex flex-col gap-3 rounded-2xl border p-4 transition hover:border-forest/35 hover:bg-warm sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-extrabold text-navy">{item.protocol}</p><p className="mt-1 truncate text-sm text-muted">{item.customer_name} • {quoteServiceLabels[item.service as QuoteService]} • {item.city}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><StatusBadge status={item.status} /><time className="text-xs text-muted">{formatDateTime(item.created_at)}</time></div></Link>) : <div className="rounded-2xl bg-warm p-8 text-center text-muted">Nenhuma solicitação recebida ainda.</div>}</div>
    </section></>;
}
