import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { ContactMapCard } from "@/components/ContactMapCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { company } from "@/config/company";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Contato", "Fale com a Micronativa sobre energia solar, segurança, controle de acesso e automação no Paraná.", "/contato");

export default function Page() {
  return <><section className="bg-white"><div className="container-site py-10"><Breadcrumbs items={[{ label: "Contato" }]} /><div className="max-w-4xl py-16"><p className="eyebrow">Vamos conversar</p><h1 className="display-title mt-5">Conte o que seu imóvel precisa.</h1><p className="body-large mt-6">Use o formulário para uma mensagem breve ou abra o orçamento em etapas para enviar informações técnicas e anexos.</p></div></div></section>
    <section className="section-pad"><div className="container-site grid gap-8 xl:grid-cols-[.72fr_1.28fr]"><aside className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1"><div className="card p-6"><Phone className="size-6 text-forest" /><h2 className="mt-4 font-bold">Telefone</h2><a href={`tel:${company.phoneHref}`} className="mt-2 block font-semibold text-muted hover:text-forest">{company.phoneDisplay}</a><WhatsAppButton context="home" variant="inline" label="Falar pelo WhatsApp" className="mt-3" /></div><div className="card p-6"><Mail className="size-6 text-forest" /><h2 className="mt-4 font-bold">E-mail</h2><a href={`mailto:${company.email}`} className="mt-2 block break-all text-muted hover:text-forest">{company.email}</a></div><div className="card p-6"><Clock className="size-6 text-forest" /><h2 className="mt-4 font-bold">Horário comercial</h2><p className="mt-2 text-muted">{company.hours}</p></div><div className="card p-6"><MapPin className="size-6 text-forest" /><h2 className="mt-4 font-bold">Área atendida</h2><p className="mt-2 text-muted">{company.serviceArea}</p></div></aside><div className="card p-6 sm:p-9"><h2 className="text-2xl font-bold">Enviar uma solicitação</h2><p className="mt-2 text-muted">Os dados serão armazenados com protocolo para acompanhamento.</p><div className="mt-7"><ContactForm /></div></div></div></section>
    <section className="section-pad bg-white"><div className="container-site"><ContactMapCard /></div></section></>;
}
