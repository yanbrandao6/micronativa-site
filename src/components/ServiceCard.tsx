import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";
const tones = { yellow: "bg-[#fff7d8] text-[#7c6510]", blue: "bg-navy-pale text-navy", green: "bg-forest-pale text-forest", navy: "bg-[#e5ebef] text-navy" };
export function ServiceCard({ service }: { service: Service }) {
  return <article className="card card-hover group flex h-full flex-col p-6 sm:p-8">
    <span className={"grid size-14 place-items-center rounded-2xl " + tones[service.tone]}><service.icon className="size-7" /></span>
    <h3 className="mt-7 text-2xl font-bold tracking-tight">{service.title}</h3><p className="mt-3 flex-1 leading-7 text-muted">{service.description}</p>
    <Link href={"/" + service.slug} className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-forest">Conhecer {service.short.toLowerCase()} <ArrowUpRight className="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
  </article>;
}
