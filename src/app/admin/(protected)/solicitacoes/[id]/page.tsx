import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Mail, MessageCircle, Phone } from "lucide-react";
import { AddNoteForm, ArchiveRequestButton, AttachmentDownloadButton, CopyProtocolButton, StatusUpdateForm } from "@/components/admin/AdminRequestActions";
import { StatusBadge } from "@/components/StatusBadge";
import { quoteStatuses } from "@/config/quoteStatuses";
import { quoteServiceLabels } from "@/config/quoteServices";
import type { QuoteService } from "@/features/quote-request/types/quoteRequest";
import { requireAdmin } from "@/lib/adminAuth";
import { formatDateTime } from "@/lib/formatters";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detalhes da solicitação | Administração Micronativa" };

function detailsEntries(value: Json): Array<[string, string | boolean]> {
  if (!value || Array.isArray(value) || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, item]) => typeof item === "string" || typeof item === "boolean" ? [[key, item] as [string, string | boolean]] : []);
}

function whatsappNumber(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  const { data: request, error } = await admin.supabase.from("quote_requests").select("*").eq("id", id).is("archived_at", null).maybeSingle();
  if (error || !request) notFound();

  const [historyResult, notesResult, attachmentsResult] = await Promise.all([
    admin.supabase.from("quote_request_status_history").select("id, previous_status, new_status, public_message, changed_by, created_at").eq("quote_request_id", id).order("created_at", { ascending: true }),
    admin.supabase.from("quote_request_notes").select("id, author_id, content, created_at, updated_at").eq("quote_request_id", id).order("created_at", { ascending: false }),
    admin.supabase.from("quote_request_attachments").select("id, original_name, mime_type, size_bytes, created_at").eq("quote_request_id", id).order("attachment_index", { ascending: true }),
  ]);
  if (historyResult.error || notesResult.error || attachmentsResult.error) throw new Error("Falha ao carregar detalhes relacionados.");

  const serviceLabel = quoteServiceLabels[request.service as QuoteService] ?? request.service;
  const detailItems = detailsEntries(request.project_details);
  const customerWhatsapp = whatsappNumber(request.customer_whatsapp_normalized || request.customer_phone_normalized);

  return <><Link href="/admin/solicitacoes" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest hover:underline"><ArrowLeft className="size-4" />Voltar às solicitações</Link>
    <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-extrabold text-navy sm:text-4xl">{request.protocol}</h1><StatusBadge status={request.status} /></div><p className="mt-2 text-muted">Recebida em {formatDateTime(request.created_at)} • atualização em {formatDateTime(request.updated_at)}</p></div><div className="flex flex-wrap gap-3"><CopyProtocolButton protocol={request.protocol} />{admin.role === "administrador" && <ArchiveRequestButton requestId={request.id} />}</div></div>

    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="min-w-0 space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Cliente e contato</h2><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Nome</dt><dd className="mt-1 font-semibold">{request.customer_name}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Contato preferido</dt><dd className="mt-1 font-semibold">{request.preferred_contact_method}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Telefone</dt><dd className="mt-1 font-semibold">{request.customer_phone}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">WhatsApp</dt><dd className="mt-1 font-semibold">{request.customer_whatsapp || "Mesmo telefone informado"}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-muted">E-mail</dt><dd className="mt-1 break-all font-semibold">{request.customer_email}</dd></div></dl><div className="mt-6 flex flex-wrap gap-3"><a href={`https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(`Olá! Entramos em contato sobre a solicitação ${request.protocol}.`)}`} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle className="size-4" />Abrir WhatsApp</a><a href={`tel:${request.customer_phone_normalized}`} className="btn-secondary"><Phone className="size-4" />Ligar</a><a href={`mailto:${request.customer_email}?subject=${encodeURIComponent(`Solicitação ${request.protocol}`)}`} className="btn-secondary"><Mail className="size-4" />Enviar e-mail</a></div></section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Projeto solicitado</h2><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Serviço</dt><dd className="mt-1 font-semibold">{serviceLabel}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Serviços adicionais</dt><dd className="mt-1 font-semibold">{request.additional_services.length ? request.additional_services.map((service) => quoteServiceLabels[service as QuoteService] ?? service).join(", ") : "Nenhum"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Imóvel</dt><dd className="mt-1 font-semibold">{request.property_type}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Finalidade</dt><dd className="mt-1 font-semibold">{request.purpose}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Cidade e estado</dt><dd className="mt-1 font-semibold">{request.city}, {request.state}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-muted">Origem</dt><dd className="mt-1 font-semibold">{request.source_page}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-muted">Projeto de referência</dt><dd className="mt-1 font-semibold">{request.project_reference ?? "Nenhum"}</dd></div></dl>{detailItems.length > 0 && <div className="mt-7 border-t pt-6"><h3 className="font-bold">Detalhes informados</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2">{detailItems.map(([key, value]) => <div key={key} className="rounded-2xl bg-warm p-4"><dt className="break-words text-xs font-bold uppercase tracking-wider text-muted">{key}</dt><dd className="mt-2 break-words text-sm leading-6">{typeof value === "boolean" ? value ? "Sim" : "Não" : value}</dd></div>)}</dl></div>}<p className="mt-7 border-t pt-5 text-sm text-muted">Consentimento LGPD registrado em {formatDateTime(request.privacy_consent_at)}.</p></section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Anexos privados</h2>{attachmentsResult.data?.length ? <ul className="mt-5 space-y-3">{attachmentsResult.data.map((attachment) => <li key={attachment.id} className="flex flex-col gap-4 rounded-2xl bg-warm p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><FileText className="size-5 shrink-0 text-forest" /><div className="min-w-0"><p className="truncate font-bold">{attachment.original_name}</p><p className="text-xs text-muted">{attachment.mime_type} • {(attachment.size_bytes / 1024 / 1024).toFixed(1)} MB</p></div></div><AttachmentDownloadButton requestId={request.id} attachmentId={attachment.id} name={attachment.original_name} /></li>)}</ul> : <p className="mt-4 rounded-2xl bg-warm p-5 text-muted">Nenhum anexo enviado.</p>}</section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Histórico de status</h2><ol className="mt-6 space-y-4">{historyResult.data?.map((event, index) => <li key={event.id} className="flex gap-4"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-forest text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1 rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{quoteStatuses[event.new_status].label}</strong><time className="text-xs text-muted">{formatDateTime(event.created_at)}</time></div><p className="mt-2 text-sm leading-6 text-muted">{event.public_message}</p>{event.changed_by && <p className="mt-2 text-xs text-muted">Alterado por usuário autorizado.</p>}</div></li>)}</ol></section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">Notas internas</h2><div className="mt-5"><AddNoteForm requestId={request.id} /></div><div className="mt-6 space-y-3">{notesResult.data?.length ? notesResult.data.map((note) => <article key={note.id} className="rounded-2xl bg-slate-50 p-4"><p className="whitespace-pre-wrap break-words text-sm leading-6">{note.content}</p><p className="mt-3 text-xs text-muted">{formatDateTime(note.created_at)} • usuário autorizado</p></article>) : <p className="rounded-2xl bg-warm p-5 text-sm text-muted">Nenhuma nota interna adicionada.</p>}</div></section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-8"><section className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Alterar status</h2><p className="mt-2 text-sm leading-6 text-muted">A alteração é validada pelo banco e registrada no histórico.</p><div className="mt-5"><StatusUpdateForm requestId={request.id} currentStatus={request.status} role={admin.role} /></div></section><section className="rounded-3xl border bg-navy p-6 text-white"><h2 className="font-bold">Privacidade</h2><p className="mt-2 text-sm leading-6 text-white/70">Notas e anexos são internos. Somente a mensagem pública do histórico aparece para o cliente.</p><Link href="/consultar-protocolo" target="_blank" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-solar hover:underline">Abrir consulta pública <ExternalLink className="size-4" /></Link></section></aside>
    </div>
  </>;
}
