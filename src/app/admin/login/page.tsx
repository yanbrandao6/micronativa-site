import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminContext } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar | Administração Micronativa", robots: { index: false, follow: false } };

export default async function Page() {
  const auth = await getAdminContext();
  if (auth.kind === "authenticated") redirect("/admin");
  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-navy via-navy to-forest px-5 py-12"><section className="w-full max-w-md rounded-4xl bg-white p-7 shadow-2xl sm:p-10"><img src="/images/brand/micronativa-logo.jpg" alt="Micronativa" className="size-16 rounded-2xl object-cover" /><p className="eyebrow mt-7">Área restrita</p><h1 className="mt-3 text-3xl font-bold">Acesse o painel</h1><p className="mt-3 leading-7 text-muted">Use o usuário criado no Supabase Auth e autorizado em <code>admin_users</code>.</p><Suspense><AdminLoginForm /></Suspense></section></main>;
}
