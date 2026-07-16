"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FAQItem { question: string; answer: string }
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="mx-auto max-w-3xl divide-y rounded-3xl border bg-white px-5 sm:px-8">
    {items.map((item, index) => {
      const active = open === index;
      return <div key={item.question}>
        <h3><button type="button" className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left font-bold" aria-expanded={active} aria-controls={"faq-" + index} onClick={() => setOpen(active ? null : index)}>{item.question}<ChevronDown className={cn("size-5 shrink-0 transition", active && "rotate-180")} /></button></h3>
        <div id={"faq-" + index} className={cn("grid transition-all", active ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="leading-7 text-muted">{item.answer}</p></div></div>
      </div>;
    })}
  </div>;
}
