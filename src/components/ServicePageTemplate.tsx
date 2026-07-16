import Link from "next/link";
import { ArrowRight, Check, CircleDot, ClipboardCheck, Hammer, Search, Settings2 } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import type { Service } from "@/data/services";

export function ServicePageTemplate({ service }: { service: Service }) {
  const faq = [
    {
      question: "Como saber qual sistema é adequado?",
      answer: "A definição depende do objetivo, da infraestrutura e do uso do imóvel. O levantamento técnico ajuda a dimensionar a solução.",
    },
    {
      question: "É necessário fazer uma visita técnica?",
      answer: "Em muitos casos, sim. A visita confirma medidas, infraestrutura, acesso, condições de instalação e equipamentos necessários.",
    },
    {
      question: "Vocês realizam manutenção?",
      answer: "Sim. A equipe pode avaliar o sistema e indicar a manutenção adequada conforme o diagnóstico.",
    },
  ];

  const executionSteps = [
    [Search, "Levantamento", "Entendemos o imóvel e a necessidade."],
    [ClipboardCheck, "Projeto", "Definimos escopo e componentes."],
    [Hammer, "Instalação", "Executamos com organização técnica."],
    [Settings2, "Testes e suporte", "Configuramos, testamos e orientamos."],
  ] as const;

  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="container-site py-10">
          <Breadcrumbs items={[{ label: "Soluções", href: "/solucoes" }, { label: service.title }]} />
          <div className="grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="eyebrow">{service.eyebrow}</p>
              <h1 className="display-title mt-5">{service.heading}</h1>
              <p className="body-large mt-6">{service.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary" href={`/orcamento?service=${service.slug}&source=service`}>
                  Solicitar avaliação <ArrowRight className="size-4" />
                </Link>
                <Link className="btn-secondary" href="#como-funciona">Como funciona</Link>
              </div>
            </div>
            <figure className="group relative aspect-square overflow-hidden rounded-4xl border bg-navy-pale shadow-soft">
              <img
                src={service.image}
                alt={service.imageAlt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                decoding="async"
                fetchPriority="high"
              />
              <figcaption className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-forest">Projeto sob medida</p>
                <p className="mt-1 font-bold text-navy">Da avaliação ao suporte.</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading eyebrow="Principais benefícios" title="Tecnologia bem aplicada ao seu dia a dia" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map((benefit) => (
              <article key={benefit} className="card p-6">
                <Check className="size-6 text-forest" />
                <h3 className="mt-5 font-bold">{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy text-white">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Diagnóstico" title="Problemas que esta solução ajuda a resolver" />
            <ul className="mt-8 grid gap-3">
              {service.solves.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-white/5 p-4">
                  <CircleDot className="size-5 shrink-0 text-solar" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sistemas e possibilidades</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {service.systems.map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-white/10 pb-3 text-white/75">
                  <Check className="size-4 shrink-0 text-solar" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading eyebrow="Aplicações" title="Projetos para diferentes perfis" />
          <div className="mt-10 flex flex-wrap gap-3">
            {service.segments.map((segment) => (
              <span key={segment} className="rounded-full border bg-white px-5 py-3 font-bold text-navy">{segment}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section-pad bg-white">
        <div className="container-site">
          <SectionHeading eyebrow="Execução" title="Como conduzimos a instalação" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {executionSteps.map(([Icon, title, description]) => (
              <article key={title} className="rounded-3xl border bg-warm p-6 shadow-sm">
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-forest shadow-sm">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-site">
          <SectionHeading align="center" eyebrow="Dúvidas" title={`Perguntas sobre ${service.title}`} />
          <div className="mt-10"><FAQAccordion items={faq} /></div>
        </div>
      </section>
      <CTASection context={service.whatsappContext} service={service.slug} />
    </>
  );
}
