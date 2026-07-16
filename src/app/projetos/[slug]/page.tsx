import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ProjectCard } from "@/components/ProjectCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getProject, projects } from "@/data/projects";
import { company } from "@/config/company";

export function generateStaticParams() {
  return projects.filter((project) => project.published).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = project.title + " | Projetos Micronativa";
  return {
    title,
    description: project.summary,
    alternates: { canonical: company.siteUrl + "/projetos/" + project.slug },
    openGraph: { title, description: project.summary, images: [project.coverImage.src] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const gallery = project.gallery.length ? project.gallery : [project.coverImage, project.coverImage];
  const related = projects.filter((item) => item.id !== project.id && item.published && (item.category === project.category || item.additionalServices?.includes(project.category as never))).slice(0, 3);

  return <>
    <article>
      <section className="bg-white"><div className="container-site py-10">
        <Breadcrumbs items={[{ label: "Projetos", href: "/projetos" }, { label: project.title }]} />
        <div className="grid items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-forest-pale px-3 py-1 text-xs font-bold text-forest">{project.categoryLabel}</span>{project.isPlaceholder && <span className="rounded-full bg-solar/25 px-3 py-1 text-xs font-bold">Estudo demonstrativo</span>}</div>
            <h1 className="display-title mt-5">{project.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-muted"><MapPin className="size-4" />{project.city} — {project.state} • {project.propertyType}</p>
            <p className="body-large mt-6">{project.summary}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-navy-pale shadow-soft"><img src={project.coverImage.src} alt={project.coverImage.alt} className="h-full w-full object-cover" /></div>
        </div>
      </div></section>

      <section className="section-pad"><div className="container-site grid gap-12 lg:grid-cols-[1fr_.6fr]">
        <div className="space-y-12">
          <div><p className="eyebrow">Contexto</p><h2 className="section-title mt-4">O desafio</h2><p className="body-large mt-5">{project.challenge}</p></div>
          <div><p className="eyebrow">Execução</p><h2 className="section-title mt-4">A solução implementada</h2><p className="body-large mt-5">{project.solution}</p></div>
          <div><p className="eyebrow">Resultado</p><h2 className="section-title mt-4">O resultado</h2><p className="body-large mt-5">{project.result}</p></div>
        </div>
        <aside className="h-fit rounded-3xl bg-navy p-7 text-white">
          <h2 className="text-xl font-bold">Escopo demonstrativo</h2>
          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-solar">Equipamentos e serviços</p>
          <ul className="mt-3 space-y-3">{project.equipmentCategories.map((item) => <li key={item} className="flex gap-2 text-sm text-white/75"><Check className="size-4 shrink-0 text-solar" />{item}</li>)}</ul>
          <p className="mt-7 text-sm font-bold uppercase tracking-wider text-solar">Áreas de instalação</p>
          <ul className="mt-3 space-y-3">{project.installationAreas.map((item) => <li key={item} className="flex gap-2 text-sm text-white/75"><Check className="size-4 shrink-0 text-solar" />{item}</li>)}</ul>
        </aside>
      </div></section>

      <section className="section-pad bg-white"><div className="container-site">
        <p className="eyebrow">Registro visual</p><h2 className="section-title mt-4">Galeria do projeto</h2>
        <p className="mt-4 text-muted">Imagens demonstrativas repetidas para validar o layout. Substitua por registros reais com autorização.</p>
        <div className="mt-8"><ProjectGallery images={gallery} /></div>
      </div></section>
    </article>

    <section className="section-pad bg-forest-pale"><div className="container-site"><div className="mx-auto max-w-3xl text-center">
      <p className="eyebrow">Projeto semelhante</p><h2 className="section-title mt-4">Precisa de uma solução parecida?</h2>
      <p className="body-large mt-4">Converse com nossa equipe para avaliar as necessidades do seu imóvel.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/orcamento?service=${project.category}&project=${project.slug}&source=project`} className="btn-primary">Solicitar projeto semelhante</Link><WhatsAppButton context="project" projectTitle={project.title} label="Falar pelo WhatsApp" variant="secondary" /></div>
    </div></div></section>

    {related.length > 0 && <section className="section-pad"><div className="container-site"><h2 className="section-title">Projetos relacionados</h2><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProjectCard key={item.id} project={item} />)}</div></div></section>}
  </>;
}
