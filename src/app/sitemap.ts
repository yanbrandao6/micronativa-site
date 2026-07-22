import type { MetadataRoute } from "next";
import { company } from "@/config/company";
import { services } from "@/data/services";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/solucoes", "/projetos", "/sobre", "/contato", "/orcamento", "/consultar-protocolo", "/politica-de-privacidade", ...services.map((service) => `/${service.slug}`), ...projects.filter((project) => project.published).map((project) => `/projetos/${project.slug}`)];
  return paths.map((path) => ({ url: `${company.siteUrl}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : .7 }));
}
