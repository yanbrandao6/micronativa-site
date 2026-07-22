"use client";

import Link from "next/link";
import { Check, LoaderCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { SelectField } from "@/components/forms/SelectField";
import { quoteServiceOptions } from "@/config/quoteServices";
import { formatPhone } from "@/features/quote-request/utils/format";
import type { ContactMethod, PropertyType, QuoteRequest, QuoteService, QuoteSubmissionResult } from "@/features/quote-request/types/quoteRequest";
import { submitQuoteRequest } from "@/services/quoteRequestService";

const propertyOptions: PropertyType[] = ["Residência", "Comércio", "Empresa", "Condomínio", "Indústria", "Propriedade rural", "Outro"];
const contactOptions: ContactMethod[] = ["WhatsApp", "Telefone", "E-mail"];

export function ContactForm() {
  const [service, setService] = useState<QuoteService>("energia-solar");
  const [propertyType, setPropertyType] = useState<PropertyType>("Residência");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("WhatsApp");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<QuoteSubmissionResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => setIdempotencyKey(crypto.randomUUID()), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idempotencyKey || status === "loading") return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "");
    const email = String(form.get("email") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const consent = form.get("consent") === "on";
    if (name.length < 3 || phone.replace(/\D/g, "").length < 10 || !/^\S+@\S+\.\S+$/.test(email) || city.length < 2 || !consent) {
      setError("Preencha nome, telefone, e-mail, cidade e confirme o consentimento.");
      setStatus("error");
      return;
    }
    const request: QuoteRequest = {
      service,
      additionalServices: [],
      propertyType,
      purpose: "Avaliação técnica",
      city,
      state: "PR",
      projectDetails: { message },
      attachments: [],
      customer: { name, phone, whatsapp: phone, email },
      preferredContactMethod: contactMethod,
      privacyConsent: true,
      sourcePage: "contact",
      website: String(form.get("website") ?? ""),
    };
    setStatus("loading"); setError("");
    try {
      const submitted = await submitQuoteRequest(request, idempotencyKey);
      setResult(submitted); setStatus("success");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Não foi possível enviar a mensagem.");
      setStatus("error");
    }
  }

  if (status === "success" && result) return <div className="rounded-3xl bg-forest-pale p-8 text-center" aria-live="polite"><Check className="mx-auto size-10 text-forest" /><h2 className="mt-4 text-2xl font-bold">Solicitação enviada</h2><p className="mt-2 text-muted">Guarde o protocolo <strong className="text-navy">{result.protocol}</strong> para acompanhar o atendimento.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/consultar-protocolo?protocolo=${encodeURIComponent(result.protocol)}`} className="btn-primary">Acompanhar solicitação</Link><button type="button" className="btn-secondary" onClick={() => { setResult(null); setStatus("idle"); setIdempotencyKey(crypto.randomUUID()); }}>Enviar outra</button></div></div>;

  return <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
    <label className="font-bold">Nome<input name="name" className="input mt-2" maxLength={160} autoComplete="name" required /></label>
    <label className="font-bold">Telefone ou WhatsApp<input name="phone" type="tel" inputMode="tel" className="input mt-2" autoComplete="tel" onChange={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }} required /></label>
    <label className="font-bold">E-mail<input name="email" type="email" inputMode="email" className="input mt-2" maxLength={254} autoComplete="email" required /></label>
    <label className="font-bold">Cidade<input name="city" className="input mt-2" maxLength={120} autoComplete="address-level2" required /><span className="mt-2 block text-xs font-normal text-muted">Atendimento em todo o estado do Paraná.</span></label>
    <SelectField id="contact-property" label="Tipo de cliente" value={propertyType} onValueChange={(value) => setPropertyType(value as PropertyType)} options={propertyOptions.map((value) => ({ value, label: value }))} />
    <SelectField id="contact-service" label="Serviço de interesse" value={service} onValueChange={(value) => setService(value as QuoteService)} options={quoteServiceOptions} />
    <SelectField id="contact-method" className="sm:col-span-2" label="Forma de contato preferida" value={contactMethod} onValueChange={(value) => setContactMethod(value as ContactMethod)} options={contactOptions.map((value) => ({ value, label: value }))} />
    <label className="font-bold sm:col-span-2">Mensagem<textarea name="message" className="input mt-2 min-h-36 resize-y" maxLength={2000} /></label>
    <label className="flex items-start gap-3 rounded-2xl bg-warm p-4 sm:col-span-2"><input name="consent" type="checkbox" className="mt-1 size-5" required /><span className="text-sm leading-6">Autorizo o tratamento dos meus dados para este atendimento, conforme a <Link href="/politica-de-privacidade" className="font-bold text-forest underline">Política de Privacidade</Link>.</span></label>
    <label className="absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 sm:col-span-2">{error}</p>}
    <div className="sm:col-span-2"><button disabled={status === "loading" || !idempotencyKey} className="btn-primary">{status === "loading" ? <><LoaderCircle className="size-4 animate-spin" />Enviando</> : <>Enviar solicitação <Send className="size-4" /></>}</button></div>
  </form>;
}
