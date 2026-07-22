"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="rounded-3xl border bg-white p-8 text-center"><AlertTriangle className="mx-auto size-10 text-red-700" /><h1 className="mt-4 text-2xl font-bold">Não foi possível carregar o painel</h1><p className="mt-2 text-muted">Verifique a conexão e tente novamente.</p><button type="button" onClick={reset} className="btn-secondary mt-6">Tentar novamente</button></div>;
}
