import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = { title: "Acesso negado | Micronativa", robots: { index: false, follow: false } };

export default function Page() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="card max-w-lg p-9 text-center"><ShieldX className="mx-auto size-12 text-red-700" /><h1 className="mt-5 text-3xl font-bold">Acesso não autorizado</h1><p className="mt-4 leading-7 text-muted">Sua conta está autenticada, mas não possui um registro administrativo ativo.</p><Link href="/admin/login" className="btn-secondary mt-7">Voltar ao login</Link></div></main>;
}
