"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { adminRoleLabels, type AdminRole } from "@/config/quoteStatuses";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/solicitacoes", label: "Solicitações", icon: ClipboardList },
];

export function AdminShell({ children, email, role }: { children: React.ReactNode; email: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await createBrowserSupabaseClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = <div className="flex h-full flex-col bg-navy p-5 text-white">
    <div className="flex items-center gap-3 border-b border-white/10 pb-5"><img src="/images/brand/micronativa-logo.jpg" alt="" className="size-11 rounded-xl object-cover" /><div><p className="text-sm font-extrabold tracking-wide">MICRONATIVA</p><p className="text-xs text-white/60">Painel administrativo</p></div></div>
    <nav className="mt-6 space-y-2" aria-label="Navegação administrativa">{navigation.map((item) => { const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition", active ? "bg-white text-navy" : "text-white/75 hover:bg-white/10 hover:text-white")}><item.icon className="size-5" />{item.label}</Link>; })}</nav>
    <div className="mt-auto border-t border-white/10 pt-5"><p className="truncate text-sm font-bold">{email}</p><p className="mt-1 text-xs text-white/60">{adminRoleLabels[role]}</p><button type="button" onClick={logout} disabled={leaving} className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />{leaving ? "Saindo…" : "Sair"}</button></div>
  </div>;

  return <div className="min-h-screen bg-slate-50 text-ink">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{sidebar}</aside>
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b bg-white/95 px-5 backdrop-blur lg:hidden"><div><p className="font-extrabold text-navy">MICRONATIVA</p><p className="text-xs text-muted">Painel administrativo</p></div><button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-xl border" aria-label="Abrir menu"><Menu className="size-5" /></button></header>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-navy/55" aria-label="Fechar menu" onClick={() => setOpen(false)} /><aside className="relative h-full w-[min(20rem,88vw)] shadow-2xl">{sidebar}<button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl bg-white/10" aria-label="Fechar menu"><X className="size-5" /></button></aside></div>}
    <main className="min-w-0 lg:pl-72"><div className="mx-auto max-w-[105rem] p-5 sm:p-8 lg:p-10">{children}</div></main>
  </div>;
}
