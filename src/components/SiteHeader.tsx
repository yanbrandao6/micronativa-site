"use client";
import Link from "next/link";
import { ChevronDown, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-navy/10 bg-warm/95 backdrop-blur">
    <a href="#conteudo" className="absolute -top-20 left-4 z-[60] rounded-lg bg-navy px-4 py-3 text-white focus:top-3">Pular para o conteúdo</a>
    <div className="container-site flex min-h-20 items-center justify-between gap-6">
      <Link href="/" className="flex items-center gap-3" aria-label="Micronativa — página inicial">
        <span className="grid size-10 place-items-center rounded-xl bg-forest text-white"><ShieldCheck aria-hidden="true" /></span>
        <span className="text-xl font-extrabold tracking-[-.04em] text-navy">micro<span className="text-forest">nativa</span></span>
      </Link>
      <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
        <Link className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-white" href="/">Início</Link>
        <div className="group relative">
          <Link className="flex items-center gap-1 rounded-full px-4 py-3 text-sm font-semibold hover:bg-white" href="/solucoes">Soluções <ChevronDown className="size-4" /></Link>
          <div className="invisible absolute left-0 top-full w-72 translate-y-2 rounded-2xl border bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {services.map((service) => <Link key={service.slug} href={"/" + service.slug} className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold hover:bg-warm"><service.icon className="size-5 text-forest" />{service.title}</Link>)}
          </div>
        </div>
        <Link className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-white" href="/projetos">Projetos</Link>
        <Link className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-white" href="/sobre">Sobre</Link>
        <Link className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-white" href="/contato">Contato</Link>
      </nav>
      <div className="hidden lg:block"><Link href="/orcamento" className="btn-primary">Solicitar orçamento</Link></div>
      <button type="button" className="grid size-12 place-items-center rounded-full border bg-white lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
    </div>
    <div id="menu-mobile" className={cn("border-t bg-white lg:hidden", open ? "block" : "hidden")}>
      <nav className="container-site grid gap-1 py-4" aria-label="Navegação móvel">
        {[["Início","/"],["Soluções","/solucoes"],["Projetos","/projetos"],["Sobre","/sobre"],["Contato","/contato"]].map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} href={href} className="rounded-xl px-4 py-3 font-semibold hover:bg-warm">{label}</Link>)}
        <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wider text-muted">Serviços</p>
        {services.map((service) => <Link key={service.slug} onClick={() => setOpen(false)} href={"/" + service.slug} className="rounded-xl px-4 py-3 text-sm font-semibold text-forest hover:bg-warm">{service.title}</Link>)}
        <Link onClick={() => setOpen(false)} href="/orcamento" className="btn-primary mt-3">Solicitar orçamento</Link>
      </nav>
    </div>
  </header>;
}
