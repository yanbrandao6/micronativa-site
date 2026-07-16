import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-2 text-sm text-muted">
    <Link href="/" className="hover:text-forest">Início</Link>
    {items.map((item) => <span key={item.label} className="flex items-center gap-2"><ChevronRight className="size-4" />{item.href ? <Link href={item.href} className="hover:text-forest">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}
  </nav>;
}
