import { ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { company } from "@/config/company";

const query = encodeURIComponent(company.address);
const searchUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

export function ContactMapCard() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  return <section className="overflow-hidden rounded-4xl border bg-white shadow-soft"><div className="grid lg:grid-cols-[1.25fr_.75fr]">
    <div className="min-h-[22rem] bg-navy-pale sm:min-h-[26rem]">
      {key ? <iframe title="Localização da Micronativa em Curitiba" src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}`} className="h-full min-h-[22rem] w-full border-0 sm:min-h-[26rem]" loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="grid h-full min-h-[22rem] place-items-center bg-gradient-to-br from-navy-pale to-forest-pale p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white text-forest shadow-sm"><MapPin className="size-8" /></span><h2 className="mt-5 text-2xl font-bold">Micronativa em Curitiba</h2><p className="mx-auto mt-3 max-w-lg leading-7 text-muted">{company.address}</p><a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">Abrir no Google Maps <ExternalLink className="size-4" /></a></div></div>}
    </div>
    <div className="p-6 sm:p-8"><p className="eyebrow">Nossa localização</p><h2 className="mt-4 text-2xl font-bold">Fale com a Micronativa</h2><ul className="mt-6 space-y-5 text-sm leading-6"><li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-forest" /><span>{company.address}</span></li><li><a href={`tel:${company.phoneHref}`} className="flex min-h-11 items-center gap-3 font-bold text-navy hover:text-forest"><Phone className="size-5 text-forest" />{company.phoneDisplay}</a></li><li><a href={`mailto:${company.email}`} className="flex min-h-11 items-center gap-3 break-all font-bold text-navy hover:text-forest"><Mail className="size-5 shrink-0 text-forest" />{company.email}</a></li></ul><p className="mt-6 rounded-2xl bg-forest-pale p-4 text-sm font-semibold text-forest-dark">{company.serviceArea}</p><div className="mt-6 grid gap-3"><a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">Abrir no Google Maps <ExternalLink className="size-4" /></a><a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Como chegar <Navigation className="size-4" /></a></div></div>
  </div></section>;
}
