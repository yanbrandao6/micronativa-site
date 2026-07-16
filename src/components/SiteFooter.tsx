import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { company } from "@/config/company";
import { services } from "@/data/services";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteFooter() {
  return <footer className="bg-[#0d2f29] text-white">
    <div className="container-site grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-solar text-navy"><ShieldCheck /></span><span className="text-xl font-extrabold">micronativa</span></Link>
        <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">Solu??es integradas em energia, seguran?a e automa??o para im?veis mais eficientes, protegidos e inteligentes.</p>
        <WhatsAppButton context="home" variant="secondary" label="Chamar no WhatsApp" className="mt-6 border-white/20 bg-white/10 text-white hover:bg-white hover:text-forest" />
      </div>
      <div><h2 className="font-bold">Solu??es</h2><ul className="mt-4 space-y-3 text-sm text-white/70">{services.map((s) => <li key={s.slug}><Link className="hover:text-white" href={"/" + s.slug}>{s.title}</Link></li>)}</ul></div>
      <div><h2 className="font-bold">Navega??o</h2><ul className="mt-4 space-y-3 text-sm text-white/70"><li><Link href="/projetos">Projetos</Link></li><li><Link href="/sobre">Sobre a empresa</Link></li><li><Link href="/contato">Contato</Link></li><li><Link href="/politica-de-privacidade">Pol?tica de Privacidade</Link></li></ul></div>
      <div><h2 className="font-bold">Contato</h2><ul className="mt-4 space-y-4 text-sm text-white/70"><li className="flex gap-3"><Phone className="size-5 shrink-0 text-solar" />{company.phoneDisplay}</li><li className="flex gap-3"><Mail className="size-5 shrink-0 text-solar" />{company.email}</li><li className="flex gap-3"><MapPin className="size-5 shrink-0 text-solar" />{company.serviceArea}</li></ul><div className="mt-5 flex gap-3"><a aria-label="Instagram" href={company.socials.instagram}><Instagram /></a><a aria-label="Facebook" href={company.socials.facebook}><Facebook /></a><a aria-label="LinkedIn" href={company.socials.linkedin}><Linkedin /></a></div></div>
    </div>
    <div className="border-t border-white/10"><div className="container-site flex flex-col gap-3 py-6 text-xs text-white/60 sm:flex-row sm:justify-between"><p>? {new Date().getFullYear()} Micronativa. Todos os direitos reservados.</p><p>Dados de contato demonstrativos ? substituir antes da divulga??o.</p></div></div>
  </footer>;
}
