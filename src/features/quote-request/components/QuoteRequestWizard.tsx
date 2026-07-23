"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, LoaderCircle, Paperclip, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SelectField } from "@/components/forms/SelectField";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { projects } from "@/data/projects";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { MAX_ATTACHMENT_FILES, validateAttachment } from "@/lib/validation/quoteRequest";
import { submitQuoteRequest } from "@/services/quoteRequestService";
import { contactMethods, propertyTypes, purposes, serviceOptions } from "../data/quoteOptions";
import type { QuoteAttachment, QuoteRequest, QuoteService, QuoteState, QuoteSubmissionResult } from "../types/quoteRequest";
import { bytes, formatPhone } from "../utils/format";

type DetailQuestion = { key: string; label: string; placeholder?: string; options?: string[] };

const initial: QuoteRequest = {
  service: "",
  additionalServices: [],
  propertyType: "",
  purpose: "",
  city: "",
  state: "PR",
  projectDetails: {},
  attachments: [],
  customer: { name: "", phone: "", whatsapp: "", email: "" },
  preferredContactMethod: "WhatsApp",
  privacyConsent: false,
  sourcePage: "direct",
  website: "",
};

const labels = Object.fromEntries(serviceOptions.map((option) => [option.value, option.label])) as Record<QuoteService, string>;
const stateOptions: Array<{ value: QuoteState; label: string }> = [
  { value: "PR", label: "Paraná" },
  { value: "SC", label: "Santa Catarina" },
];
const stateLabels: Record<QuoteState, string> = { PR: "Paraná", SC: "Santa Catarina" };
const detailQuestions: Record<QuoteService, DetailQuestion[]> = {
  "energia-solar": [
    { key: "energyBill", label: "Valor médio da conta de energia", placeholder: "Ex.: R$ 450" },
    { key: "electricalConnection", label: "Tipo de ligação elétrica", options: ["Não sei", "Monofásica", "Bifásica", "Trifásica"] },
    { key: "roofArea", label: "Área aproximada do telhado", placeholder: "Ex.: 60 m²" },
  ],
  "cftv-seguranca": [
    { key: "environments", label: "Quantidade aproximada de ambientes" },
    { key: "internalArea", label: "Área interna a monitorar" },
    { key: "externalArea", label: "Área externa a monitorar" },
    { key: "remoteAccess", label: "Acesso pelo celular?", options: ["Sim", "Não", "Ainda não sei"] },
    { key: "recording", label: "Precisa de gravação?", options: ["Sim", "Não", "Ainda não sei"] },
  ],
  "automacao-portoes": [
    { key: "gateType", label: "Tipo de portão", options: ["Deslizante", "Basculante", "Pivotante", "Outro", "Não sei"] },
    { key: "installed", label: "O portão já está instalado?", options: ["Sim", "Não"] },
    { key: "hasMotor", label: "Possui motor atualmente?", options: ["Sim", "Não", "Não sei"] },
    { key: "problem", label: "Problema atual, se houver" },
  ],
  "controle-acesso": [
    { key: "accessCount", label: "Quantidade aproximada de acessos" },
    { key: "accessType", label: "Tecnologia desejada", options: ["Tag ou cartão", "Senha", "Biometria", "Reconhecimento facial", "Fechadura eletrônica", "Vídeo porteiro", "Ainda não sei"] },
    { key: "usage", label: "Tipo de uso" },
  ],
  "projeto-integrado": [
    { key: "priorities", label: "Quais são as prioridades do projeto?" },
    { key: "infrastructure", label: "Há infraestrutura instalada?", options: ["Sim", "Não", "Parcialmente", "Não sei"] },
    { key: "phase", label: "Deseja executar por etapas?", options: ["Sim", "Não", "Ainda não sei"] },
  ],
  manutencao: [
    { key: "system", label: "Qual sistema precisa de manutenção?" },
    { key: "problem", label: "Descreva o problema observado" },
    { key: "since", label: "Quando o problema começou?" },
  ],
};

function fieldClass(error?: string) {
  return cn("input", error && "border-red-500");
}

export function QuoteRequestWizard() {
  const params = useSearchParams();
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuoteRequest>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<QuoteSubmissionResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const validService = serviceOptions.some((option) => option.value === params.get("service")) ? params.get("service") as QuoteService : "";
  const project = projects.find((item) => item.slug === params.get("project") || item.id === params.get("project"));

  useEffect(() => {
    const storedKey = sessionStorage.getItem("mn-quote-idempotency") ?? crypto.randomUUID();
    sessionStorage.setItem("mn-quote-idempotency", storedKey);
    setIdempotencyKey(storedKey);
    setData((old) => ({
      ...old,
      service: old.service || validService,
      projectReference: project?.id,
      sourcePage: ["home", "service", "project", "solutions", "contact"].includes(params.get("source") ?? "") ? params.get("source")! : "direct",
    }));
    trackEvent("quote_form_started", { source: params.get("source") ?? "direct", service: validService || undefined, projectId: project?.id });
  }, []);

  useEffect(() => { heading.current?.focus(); setErrors({}); }, [step]);
  useEffect(() => {
    try { sessionStorage.setItem("mn-quote-draft", JSON.stringify({ ...data, attachments: [] })); } catch { /* Storage may be unavailable. */ }
  }, [data]);

  const set = <K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) => setData((old) => ({ ...old, [key]: value }));
  const customer = (key: keyof QuoteRequest["customer"], value: string) => setData((old) => ({ ...old, customer: { ...old.customer, [key]: value } }));

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (step === 1 && !data.service) nextErrors.service = "Selecione uma solução.";
    if (step === 1 && data.service === "projeto-integrado" && !data.additionalServices.length) nextErrors.additional = "Selecione ao menos um serviço para integrar.";
    if (step === 2) {
      if (!data.propertyType) nextErrors.propertyType = "Selecione o tipo de imóvel.";
      if (!data.purpose) nextErrors.purpose = "Selecione a finalidade.";
      if (data.city.trim().length < 2) nextErrors.city = "Informe a cidade.";
    }
    if (step === 5) {
      if (data.customer.name.trim().length < 3) nextErrors.name = "Informe seu nome.";
      if (data.customer.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Informe um telefone válido.";
      if (!/^\S+@\S+\.\S+$/.test(data.customer.email)) nextErrors.email = "Informe um e-mail válido.";
      if (!data.privacyConsent) nextErrors.consent = "O consentimento é obrigatório.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (!validate()) return;
    trackEvent("quote_form_step_completed", { step, service: data.service, source: data.sourcePage });
    setStep((current) => Math.min(6, current + 1));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const nextFiles: QuoteAttachment[] = [];
    let message = "";
    for (const file of Array.from(list)) {
      const validation = validateAttachment(file);
      if (!validation.valid) { message = validation.error; continue; }
      if (data.attachments.length + nextFiles.length >= MAX_ATTACHMENT_FILES) { message = "Você pode enviar até 6 arquivos."; break; }
      nextFiles.push({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, file });
    }
    setErrors((current) => ({ ...current, files: message }));
    set("attachments", [...data.attachments, ...nextFiles]);
  }

  async function submit() {
    if (status === "loading" || !idempotencyKey) return;
    setStatus("loading");
    setSubmitError("");
    try {
      const submitted = await submitQuoteRequest(data, idempotencyKey);
      setResult(submitted);
      setStatus("success");
      trackEvent("quote_form_submitted", { service: data.service, source: data.sourcePage, projectId: data.projectReference, completionStatus: true });
      sessionStorage.removeItem("mn-quote-draft");
      sessionStorage.removeItem("mn-quote-idempotency");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar. Tente novamente.");
      setStatus("error");
    }
  }

  const questions = useMemo(() => data.service ? detailQuestions[data.service] : [], [data.service]);
  const isSolar = data.service === "energia-solar";

  if (status === "success" && result) return <div className="mx-auto max-w-3xl rounded-4xl border bg-white p-7 text-center shadow-soft sm:p-12" aria-live="polite">
    <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest-pale text-forest"><Check className="size-8" /></span>
    <h1 ref={heading} tabIndex={-1} className="mt-6 text-3xl font-bold focus:outline-none">Solicitação enviada com sucesso</h1>
    <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">Recebemos suas informações. Guarde o protocolo abaixo para acompanhar o andamento da solicitação.</p>
    <div className="mx-auto mt-7 max-w-lg rounded-3xl bg-warm p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Protocolo</p><p className="mt-2 break-all text-2xl font-extrabold text-navy sm:text-3xl">{result.protocol}</p>
      <dl className="mt-5 grid gap-3 text-left text-sm sm:grid-cols-2"><div><dt className="font-bold text-muted">Enviado em</dt><dd className="mt-1">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(result.createdAt))}</dd></div><div><dt className="font-bold text-muted">Serviço</dt><dd className="mt-1">{labels[result.service]}</dd></div></dl>
    </div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      <Link href={`/consultar-protocolo?protocolo=${encodeURIComponent(result.protocol)}`} className="btn-primary">Acompanhar solicitação</Link>
      <WhatsAppButton context="quote" protocol={result.protocol} service={result.service} propertyType={data.propertyType || undefined} city={`${data.city} - ${data.state}`} label="Continuar no WhatsApp" variant="secondary" />
      <Link href="/" className="btn-secondary">Voltar para o início</Link>
    </div>
  </div>;

  return <div className="mx-auto max-w-4xl">
    {project && <div className="mb-5 rounded-2xl border border-forest/20 bg-forest-pale p-4 text-sm"><strong>Projeto de referência:</strong> {project.title}<button type="button" className="ml-3 underline" onClick={() => set("projectReference", undefined)}>Remover referência</button></div>}
    <div className="mb-6"><div className="flex items-center justify-between text-sm font-bold"><span>Etapa {step} de 6</span><span className="text-muted">{["Solução", "Imóvel", "Detalhes", "Anexos", "Contato", "Revisão"][step - 1]}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-pale"><div className="h-full bg-forest transition-all" style={{ width: `${step / 6 * 100}%` }} /></div></div>
    <div className="rounded-4xl border bg-white p-5 shadow-soft sm:p-9" aria-live="polite">
      {step === 1 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">Qual solução você procura?</h1><p className="mt-2 text-muted">Escolha a necessidade principal para personalizarmos as próximas perguntas.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{serviceOptions.map((option) => <button key={option.value} type="button" aria-pressed={data.service === option.value} onClick={() => set("service", option.value)} className={cn("min-h-28 rounded-2xl border p-5 text-left transition", data.service === option.value ? "border-forest bg-forest-pale ring-2 ring-forest/15" : "hover:border-forest/40")}><option.icon className="size-6 text-forest" /><span className="mt-4 block font-bold">{option.label}</span><span className="mt-1 block text-sm text-muted">{option.description}</span></button>)}</div>{errors.service && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{errors.service}</p>}{data.service === "projeto-integrado" && <div className="mt-6"><p className="font-bold">Quais serviços deseja combinar?</p><div className="mt-3 flex flex-wrap gap-2">{serviceOptions.slice(0, 4).map((option) => <button key={option.value} type="button" aria-pressed={data.additionalServices.includes(option.value)} onClick={() => set("additionalServices", data.additionalServices.includes(option.value) ? data.additionalServices.filter((value) => value !== option.value) : [...data.additionalServices, option.value])} className={cn("min-h-11 rounded-full border px-4 py-2 text-sm font-bold", data.additionalServices.includes(option.value) && "border-forest bg-forest text-white")}>{option.label}</button>)}</div>{errors.additional && <p role="alert" className="mt-2 text-sm text-red-700">{errors.additional}</p>}</div>}</section>}

      {step === 2 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">Conte um pouco sobre o imóvel</h1><div className="mt-7 grid gap-5 sm:grid-cols-2"><SelectField id="property-type" label="Tipo de imóvel" value={data.propertyType} onValueChange={(value) => set("propertyType", value as QuoteRequest["propertyType"])} options={propertyTypes.map((value) => ({ value, label: value }))} error={errors.propertyType} /><SelectField id="project-purpose" label="Finalidade" value={data.purpose} onValueChange={(value) => set("purpose", value as QuoteRequest["purpose"])} options={purposes.map((value) => ({ value, label: value }))} error={errors.purpose} /><label className="font-bold">Cidade<input className={fieldClass(errors.city)} value={data.city} onChange={(event) => set("city", event.target.value)} autoComplete="address-level2" />{errors.city && <span className="mt-1 block text-sm text-red-700">{errors.city}</span>}</label><SelectField id="project-state" label="Estado" value={data.state} onValueChange={(value) => set("state", value as QuoteState)} options={stateOptions} helperText="Atendimento no Paraná e em Santa Catarina." /></div></section>}

      {step === 3 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">Quais são as necessidades do projeto?</h1><p className="mt-2 text-muted">Responda o que souber. A equipe confirma os detalhes no levantamento técnico.</p><div className="mt-7 grid gap-5 sm:grid-cols-2">{questions.map((item) => item.options ? <SelectField key={item.key} id={`detail-${item.key}`} label={item.label} value={String(data.projectDetails[item.key] ?? "")} onValueChange={(value) => set("projectDetails", { ...data.projectDetails, [item.key]: value })} options={item.options.map((value) => ({ value, label: value }))} /> : <label key={item.key} className="font-bold">{item.label}<input className="input" placeholder={item.placeholder} value={String(data.projectDetails[item.key] ?? "")} onChange={(event) => set("projectDetails", { ...data.projectDetails, [item.key]: event.target.value })} /></label>)}<label className="font-bold sm:col-span-2">Observações<textarea className="input min-h-32 resize-y" maxLength={2000} value={String(data.projectDetails.notes ?? "")} onChange={(event) => set("projectDetails", { ...data.projectDetails, notes: event.target.value })} /></label></div></section>}

      {step === 4 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">{isSolar ? "Anexe sua fatura de energia" : "Deseja enviar imagens ou documentos?"}</h1><p className="mt-2 text-muted">{isSolar ? "Opcional. A fatura de energia ajuda nossa equipe a entender o consumo e preparar um dimensionamento inicial mais preciso." : "Opcional. Envie imagens ou documentos que ajudem nossa equipe a compreender o projeto."} Até 6 arquivos JPG, JPEG, PNG, WEBP ou PDF, com no máximo 8 MB cada. Os arquivos são guardados em armazenamento privado.</p><label className="mt-7 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-forest/30 bg-gradient-to-br from-forest-pale to-white p-6 text-center transition hover:border-forest hover:shadow-soft"><span className="grid size-14 place-items-center rounded-2xl bg-white text-forest shadow-sm"><Paperclip className="size-7" /></span><span className="mt-4 text-lg font-bold text-navy">{isSolar ? "Anexar fatura de energia" : "Selecionar arquivos"}</span><span className="mt-2 text-sm text-muted">Clique para escolher arquivos do seu dispositivo</span><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="sr-only" onChange={(event) => addFiles(event.target.files)} /></label>{errors.files && <p role="alert" className="mt-3 text-sm text-red-700">{errors.files}</p>}<ul className="mt-5 space-y-2">{data.attachments.map((file) => <li key={file.id} className="flex items-center gap-3 rounded-2xl border p-4"><FileText className="size-5 text-forest" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{file.name}</strong><span className="text-xs text-muted">{bytes(file.size)} • pronto para envio privado</span></span><button type="button" onClick={() => set("attachments", data.attachments.filter((item) => item.id !== file.id))} className="grid size-11 place-items-center rounded-full hover:bg-red-50" aria-label={`Remover ${file.name}`}><Trash2 className="size-5" /></button></li>)}</ul></section>}

      {step === 5 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">Como podemos entrar em contato?</h1><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="font-bold">Nome<input className={fieldClass(errors.name)} maxLength={160} value={data.customer.name} onChange={(event) => customer("name", event.target.value)} autoComplete="name" />{errors.name && <span className="mt-1 block text-sm text-red-700">{errors.name}</span>}</label><label className="font-bold">Telefone<input type="tel" inputMode="tel" className={fieldClass(errors.phone)} value={data.customer.phone} onChange={(event) => customer("phone", formatPhone(event.target.value))} autoComplete="tel" />{errors.phone && <span className="mt-1 block text-sm text-red-700">{errors.phone}</span>}</label><label className="font-bold">WhatsApp<input type="tel" inputMode="tel" className="input" value={data.customer.whatsapp} onChange={(event) => customer("whatsapp", formatPhone(event.target.value))} autoComplete="tel" /></label><label className="font-bold">E-mail<input type="email" inputMode="email" className={fieldClass(errors.email)} maxLength={254} value={data.customer.email} onChange={(event) => customer("email", event.target.value)} autoComplete="email" />{errors.email && <span className="mt-1 block text-sm text-red-700">{errors.email}</span>}</label></div><SelectField id="preferred-contact" className="mt-6" label="Forma de contato preferida" value={data.preferredContactMethod} onValueChange={(value) => set("preferredContactMethod", value as QuoteRequest["preferredContactMethod"])} options={contactMethods.map((value) => ({ value, label: value }))} /><label className="mt-7 flex items-start gap-3 rounded-2xl bg-warm p-4"><input type="checkbox" checked={data.privacyConsent} onChange={(event) => set("privacyConsent", event.target.checked)} className="mt-1 size-5" /><span className="text-sm leading-6">Autorizo o uso dos meus dados para atendimento desta solicitação, conforme a <Link href="/politica-de-privacidade" className="font-bold text-forest underline">Política de Privacidade</Link>.</span></label>{errors.consent && <p role="alert" className="mt-2 text-sm text-red-700">{errors.consent}</p>}<label className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={data.website ?? ""} onChange={(event) => set("website", event.target.value)} /></label></section>}

      {step === 6 && <section><h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none">Revise sua solicitação</h1><p className="mt-2 text-muted">Você pode voltar a qualquer etapa sem perder os dados.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{[["Solução", data.service ? labels[data.service] : "—", 1], ["Imóvel", `${data.propertyType} • ${data.purpose}`, 2], ["Local", `${data.city} — ${stateLabels[data.state]}`, 2], ["Detalhes", Object.values(data.projectDetails).filter(Boolean).join(" • ") || "Sem detalhes adicionais", 3], ["Anexos", `${data.attachments.length} arquivo(s)`, 4], ["Contato", `${data.customer.name} • ${data.preferredContactMethod}`, 5]].map(([title, value, targetStep]) => <div key={title as string} className="rounded-2xl bg-warm p-5"><div className="flex items-center justify-between"><h2 className="font-bold">{title as string}</h2><button type="button" className="text-sm font-bold text-forest underline" onClick={() => setStep(targetStep as number)}>Editar</button></div><p className="mt-2 break-words text-sm leading-6 text-muted">{value as string}</p></div>)}</div>{status === "error" && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{submitError}</p>}<div className="mt-6 rounded-2xl border border-forest/25 bg-forest-pale p-4 text-sm leading-6"><strong>Envio seguro:</strong> o protocolo será criado pelo banco somente após a solicitação ser registrada. Anexos ficam privados.</div></section>}

      <div className="mt-9 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">{step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="btn-secondary"><ArrowLeft className="size-4" />Voltar</button> : <span />}{step < 6 ? <button type="button" onClick={next} className="btn-primary">Continuar <ArrowRight className="size-4" /></button> : <button type="button" onClick={submit} disabled={status === "loading" || !idempotencyKey} className="btn-primary disabled:opacity-60">{status === "loading" ? <><LoaderCircle className="size-4 animate-spin" />Enviando</> : <>Enviar solicitação <ArrowRight className="size-4" /></>}</button>}</div>
    </div>
  </div>;
}
