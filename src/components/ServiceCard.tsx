import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

const tones = {
  yellow: "bg-[#fff7d8] text-[#7c6510]",
  blue: "bg-navy-pale text-navy",
  green: "bg-forest-pale text-forest",
  navy: "bg-[#e5ebef] text-navy",
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-pale">
        <img
          src={service.image}
          alt={service.imageAlt}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <span className={`absolute left-4 top-4 grid size-12 place-items-center rounded-2xl border border-white/70 shadow-md backdrop-blur ${tones[service.tone]}`}>
          <service.icon className="size-6" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-bold tracking-tight">{service.title}</h3>
        <p className="mt-3 flex-1 leading-7 text-muted">{service.description}</p>
        <Link href={`/${service.slug}`} className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-forest">
          Conhecer {service.short.toLowerCase()}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
    </article>
  );
}
