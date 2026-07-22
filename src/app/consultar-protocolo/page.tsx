import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProtocolLookupForm } from "@/components/ProtocolLookupForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Consultar protocolo", "Acompanhe o andamento de uma solicitação enviada à Micronativa.", "/consultar-protocolo");

export default async function Page({ searchParams }: { searchParams: Promise<{ protocolo?: string }> }) {
  const { protocolo = "" } = await searchParams;
  return <section className="section-pad bg-white">
    <div className="container-site">
      <Breadcrumbs items={[{ label: "Consultar protocolo" }]} />
      <div className="mx-auto mt-10 max-w-6xl">
        <div className="max-w-3xl"><p className="eyebrow">Atendimento</p><h1 className="display-title mt-5">Acompanhe sua solicitação</h1><p className="body-large mt-5">Informe o protocolo e confirme um dado de contato utilizado no envio do formulário.</p></div>
        <div className="mt-10"><ProtocolLookupForm initialProtocol={protocolo} /></div>
      </div>
    </div>
  </section>;
}
