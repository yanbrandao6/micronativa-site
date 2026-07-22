import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { AdminRequestFilters, type AdminFilterValues } from "@/components/admin/AdminRequestFilters";
import { StatusBadge } from "@/components/StatusBadge";
import { quoteStatusOrder } from "@/config/quoteStatuses";
import { quoteServiceLabels, quoteServiceOptions } from "@/config/quoteServices";
import type { QuoteService } from "@/features/quote-request/types/quoteRequest";
import { requireAdmin } from "@/lib/adminAuth";
import { formatDateTime } from "@/lib/formatters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Solicitações | Administração Micronativa" };

const PAGE_SIZE = 20;
const valueOf = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const filters: AdminFilterValues = {
    q: valueOf(raw.q).slice(0, 120), status: valueOf(raw.status), service: valueOf(raw.service), city: valueOf(raw.city).slice(0, 120),
    from: valueOf(raw.from), to: valueOf(raw.to), order: valueOf(raw.order) || "newest",
  };
  const page = Math.max(1, Number.parseInt(valueOf(raw.page), 10) || 1);
  const { supabase } = await requireAdmin();
  let query = supabase.from("quote_requests").select("id, protocol, created_at, customer_name, customer_email, customer_phone, service, city, preferred_contact_method, status", { count: "exact" }).is("archived_at", null);

  const safeSearch = filters.q.replace(/[,%()_*]/g, " ").replace(/\s+/g, " ").trim();
  if (safeSearch) {
    const phone = safeSearch.replace(/\D/g, "");
    const terms = [`protocol.ilike.%${safeSearch}%`, `customer_name.ilike.%${safeSearch}%`, `customer_email.ilike.%${safeSearch}%`];
    if (phone.length >= 3) terms.push(`customer_phone_normalized.ilike.%${phone}%`);
    query = query.or(terms.join(","));
  }
  if (quoteStatusOrder.includes(filters.status as never)) query = query.eq("status", filters.status as never);
  if (quoteServiceOptions.some((option) => option.value === filters.service)) query = query.eq("service", filters.service);
  if (filters.city) query = query.ilike("city", `%${filters.city.replace(/[%_*]/g, " ").trim()}%`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(filters.from)) query = query.gte("created_at", `${filters.from}T00:00:00-03:00`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(filters.to)) query = query.lte("created_at", `${filters.to}T23:59:59.999-03:00`);
  query = query.order("created_at", { ascending: filters.order === "oldest" }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error("Falha ao consultar solicitações.");
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (target: number) => { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value && value !== "newest") params.set(key, value); }); params.set("page", String(target)); return `/admin/solicitacoes?${params}`; };

  return <><div><p className="eyebrow">Atendimento</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Solicitações</h1><p className="mt-2 text-muted">Pesquise, filtre e acompanhe os pedidos enviados pelo site.</p></div>
    <div className="mt-8"><AdminRequestFilters initial={filters} /></div>
    <div className="mt-6 flex items-center justify-between gap-4"><p className="text-sm font-bold text-muted">{total} {total === 1 ? "resultado" : "resultados"}</p><p className="text-sm text-muted">Página {Math.min(page, pages)} de {pages}</p></div>
    {!data?.length ? <div className="mt-5 rounded-3xl border bg-white p-12 text-center"><Inbox className="mx-auto size-11 text-forest" /><h2 className="mt-5 text-xl font-bold">Nenhuma solicitação encontrada</h2><p className="mt-2 text-muted">Ajuste os filtros ou aguarde novos envios.</p></div> : <>
      <div className="mt-5 hidden overflow-hidden rounded-3xl border bg-white shadow-sm md:block"><div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead className="bg-navy text-white"><tr>{["Protocolo", "Data", "Cliente", "Serviço", "Cidade", "Contato", "Status", "Ação"].map((label) => <th key={label} className="px-4 py-4 font-bold">{label}</th>)}</tr></thead><tbody className="divide-y">{data.map((item) => <tr key={item.id} className="hover:bg-warm"><td className="px-4 py-4 font-extrabold text-navy">{item.protocol}</td><td className="whitespace-nowrap px-4 py-4 text-muted">{formatDateTime(item.created_at)}</td><td className="max-w-56 px-4 py-4"><strong className="block truncate">{item.customer_name}</strong><span className="block truncate text-xs text-muted">{item.customer_email}</span></td><td className="px-4 py-4">{quoteServiceLabels[item.service as QuoteService]}</td><td className="px-4 py-4">{item.city}</td><td className="px-4 py-4">{item.preferred_contact_method}</td><td className="px-4 py-4"><StatusBadge status={item.status} /></td><td className="px-4 py-4"><Link href={`/admin/solicitacoes/${item.id}`} className="font-bold text-forest hover:underline">Abrir</Link></td></tr>)}</tbody></table></div></div>
      <div className="mt-5 grid gap-4 md:hidden">{data.map((item) => <Link key={item.id} href={`/admin/solicitacoes/${item.id}`} className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-forest/35"><div className="flex items-start justify-between gap-3"><div><p className="font-extrabold text-navy">{item.protocol}</p><time className="mt-1 block text-xs text-muted">{formatDateTime(item.created_at)}</time></div><StatusBadge status={item.status} /></div><h2 className="mt-5 text-lg font-bold">{item.customer_name}</h2><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs font-bold uppercase text-muted">Serviço</dt><dd className="mt-1">{quoteServiceLabels[item.service as QuoteService]}</dd></div><div><dt className="text-xs font-bold uppercase text-muted">Cidade</dt><dd className="mt-1">{item.city}</dd></div><div><dt className="text-xs font-bold uppercase text-muted">Contato</dt><dd className="mt-1">{item.preferred_contact_method}</dd></div></dl></Link>)}</div>
    </>}
    <nav className="mt-7 flex items-center justify-between" aria-label="Paginação">{page > 1 ? <Link href={pageUrl(page - 1)} className="btn-secondary"><ArrowLeft className="size-4" />Anterior</Link> : <span />}{page < pages ? <Link href={pageUrl(page + 1)} className="btn-secondary">Próxima <ArrowRight className="size-4" /></Link> : <span />}</nav>
  </>;
}
