import { Breadcrumbs } from "@/components/Breadcrumbs";
import { company } from "@/config/company";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Política de Privacidade", "Como a Micronativa trata dados pessoais enviados pelo site.", "/politica-de-privacidade");

export default function Page() {
  return <section className="section-pad bg-white"><div className="container-site"><Breadcrumbs items={[{ label: "Política de Privacidade" }]} /><article className="mx-auto mt-12 max-w-3xl"><p className="eyebrow">LGPD</p><h1 className="display-title mt-5">Política de Privacidade</h1><div className="mt-10 space-y-9 leading-8 text-muted">
    <section><h2 className="text-2xl font-bold text-ink">1. Dados coletados</h2><p className="mt-3">Recebemos os dados que você informa voluntariamente, como nome, telefone, WhatsApp, e-mail, cidade, interesse de serviço, detalhes do projeto e arquivos anexados.</p></section>
    <section><h2 className="text-2xl font-bold text-ink">2. Finalidades</h2><p className="mt-3">Os dados são usados para identificar a solicitação, avaliar necessidades técnicas, realizar contato, preparar propostas, agendar visitas e acompanhar a execução do atendimento.</p></section>
    <section><h2 className="text-2xl font-bold text-ink">3. Armazenamento e segurança</h2><p className="mt-3">Solicitações são armazenadas em ambiente protegido. Anexos permanecem privados e são disponibilizados à equipe autorizada somente por links temporários. O protocolo público exige também a confirmação do e-mail informado.</p></section>
    <section><h2 className="text-2xl font-bold text-ink">4. Compartilhamento</h2><p className="mt-3">A Micronativa não vende dados pessoais. Fornecedores essenciais de infraestrutura poderão processá-los sob medidas adequadas de segurança, confidencialidade e proteção de dados.</p></section>
    <section><h2 className="text-2xl font-bold text-ink">5. Direitos do titular</h2><p className="mt-3">Você pode solicitar confirmação, acesso, correção, informações sobre tratamento e eliminação quando aplicável, observados os prazos e as obrigações legais.</p></section>
    <section><h2 className="text-2xl font-bold text-ink">6. Contato</h2><p className="mt-3">Para assuntos de privacidade, escreva para <a className="font-bold text-forest underline" href={`mailto:${company.email}`}>{company.email}</a> ou ligue para <a className="font-bold text-forest underline" href={`tel:${company.phoneHref}`}>{company.phoneDisplay}</a>. Endereço: {company.address}.</p></section>
    <p className="text-sm">Última atualização: julho de 2026.</p>
  </div></article></div></section>;
}
