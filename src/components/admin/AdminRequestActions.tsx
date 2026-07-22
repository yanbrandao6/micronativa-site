"use client";

import { useRouter } from "next/navigation";
import { Archive, Check, Copy, Download, LoaderCircle, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { SelectField } from "@/components/forms/SelectField";
import { allowedStatusTransitions, quoteStatuses, type AdminRole, type QuoteRequestStatus } from "@/config/quoteStatuses";

export function CopyProtocolButton({ protocol }: { protocol: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" onClick={async () => { await navigator.clipboard.writeText(protocol); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="btn-secondary">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copiado" : "Copiar protocolo"}</button>;
}

export function StatusUpdateForm({ requestId, currentStatus, role }: { requestId: string; currentStatus: QuoteRequestStatus; role: AdminRole }) {
  const router = useRouter();
  const allowed = allowedStatusTransitions[currentStatus].filter((status) => role === "administrador" || !(currentStatus === "cancelado" && status === "recebido"));
  const [selected, setSelected] = useState(allowed[0] ?? "");
  const [message, setMessage] = useState(allowed[0] ? quoteStatuses[allowed[0]].publicMessage : "");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (selected === "cancelado" && !window.confirm("Confirma o cancelamento desta solicitação?")) return;
    setState("loading"); setError("");
    const response = await fetch(`/api/admin/quote-requests/${requestId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: selected, publicMessage: message }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error ?? "Não foi possível alterar o status."); setState("error"); return; }
    setState("success"); router.refresh();
  }

  if (!allowed.length) return <div className="rounded-2xl bg-warm p-4 text-sm text-muted">Este status não possui uma próxima transição disponível.</div>;
  return <form onSubmit={submit} className="space-y-4"><SelectField id="status-update" label="Novo status" value={selected} onValueChange={(value) => { const status = value as QuoteRequestStatus; setSelected(status); setMessage(quoteStatuses[status].publicMessage); setState("idle"); }} options={allowed.map((status) => ({ value: status, label: quoteStatuses[status].label }))} /><label className="block font-bold">Mensagem pública<textarea className="input mt-2 min-h-28 resize-y" maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} /></label><p className="text-xs leading-5 text-muted">Esta mensagem aparecerá na consulta pública. Não inclua observações internas.</p>{state === "error" && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}{state === "success" && <p role="status" className="rounded-xl bg-forest-pale p-3 text-sm font-semibold text-forest-dark">Status atualizado.</p>}<button disabled={state === "loading"} className="btn-primary w-full">{state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Atualizar status</button></form>;
}

export function AddNoteForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setError("");
    const response = await fetch(`/api/admin/quote-requests/${requestId}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error ?? "Não foi possível adicionar a nota."); setState("error"); return; }
    setContent(""); setState("idle"); router.refresh();
  }
  return <form onSubmit={submit}><label className="font-bold">Nova nota interna<textarea className="input mt-2 min-h-28 resize-y" value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} required /></label><p className="mt-2 text-xs text-muted">Visível apenas para usuários administrativos.</p>{error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={state === "loading" || !content.trim()} className="btn-secondary mt-4 w-full">{state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <MessageSquarePlus className="size-4" />}Adicionar nota</button></form>;
}

export function ArchiveRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return <button type="button" disabled={loading} onClick={async () => { if (!window.confirm("Arquivar esta solicitação? Ela deixará de aparecer nas listagens ativas.")) return; setLoading(true); const response = await fetch(`/api/admin/quote-requests/${requestId}/archive`, { method: "POST" }); if (response.ok) router.replace("/admin/solicitacoes"); else setLoading(false); }} className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}Arquivar</button>;
}

export function AttachmentDownloadButton({ requestId, attachmentId, name }: { requestId: string; attachmentId: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return <div><button type="button" disabled={loading} onClick={async () => { setLoading(true); setError(""); const response = await fetch(`/api/admin/quote-requests/${requestId}/attachments/${attachmentId}`); const body = await response.json().catch(() => null); if (!response.ok || !body?.url) { setError("Falha ao gerar link."); setLoading(false); return; } window.open(body.url, "_blank", "noopener,noreferrer"); setLoading(false); }} className="btn-secondary">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}Baixar {name}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
