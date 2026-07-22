"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { emailRef.current?.focus(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await createBrowserSupabaseClient().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
    {params.get("motivo") === "sessao" && <p role="status" className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Sua sessão expirou. Entre novamente.</p>}
    <div><label htmlFor="admin-email" className="font-bold">E-mail</label><input ref={emailRef} id="admin-email" name="email" className="input mt-2" type="email" inputMode="email" autoComplete="username" required /></div>
    <div><label htmlFor="admin-password" className="font-bold">Senha</label><input id="admin-password" name="password" className="input mt-2" type="password" autoComplete="current-password" required /></div>
    {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
    <button disabled={loading} className="btn-primary w-full">{loading ? <><LoaderCircle className="size-4 animate-spin" />Entrando</> : <><LockKeyhole className="size-4" />Entrar</>}</button>
  </form>;
}
