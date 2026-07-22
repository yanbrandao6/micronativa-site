import Link from "next/link";

export default function NotFound() {
  return <div className="rounded-3xl border bg-white p-10 text-center"><h1 className="text-2xl font-bold">Solicitação não encontrada</h1><p className="mt-3 text-muted">O registro pode ter sido arquivado ou não está disponível para sua conta.</p><Link href="/admin/solicitacoes" className="btn-secondary mt-6">Voltar à lista</Link></div>;
}
