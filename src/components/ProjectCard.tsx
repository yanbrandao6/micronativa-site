import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { ProjectCaseStudy } from "@/data/projects";
export function ProjectCard({ project }: { project: ProjectCaseStudy }) {
  return <article className="card card-hover group overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden bg-navy-pale"><img src={project.coverImage.src} alt={project.coverImage.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
    <div className="p-6"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-forest-pale px-3 py-1 text-xs font-bold text-forest">{project.categoryLabel}</span>{project.isPlaceholder && <span className="rounded-full bg-solar/25 px-3 py-1 text-xs font-bold text-ink">Demonstração</span>}</div>
      <h3 className="mt-4 text-xl font-bold tracking-tight">{project.title}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin className="size-4" />{project.city}, {project.state} • {project.propertyType}</p><p className="mt-4 line-clamp-3 leading-7 text-muted">{project.summary}</p>
      <Link href={"/projetos/" + project.slug} className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-forest">Ver estudo de caso <ArrowUpRight className="size-4" /></Link>
    </div>
  </article>;
}
