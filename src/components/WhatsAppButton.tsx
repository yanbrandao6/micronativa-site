"use client";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, type WhatsAppMessageInput } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function WhatsAppButton({ label = "Falar pelo WhatsApp", variant = "primary", className, ...message }: WhatsAppMessageInput & { label?: string; variant?: "primary" | "secondary" | "inline" | "floating"; className?: string }) {
  const floating = variant === "floating";
  return <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer" aria-label={floating ? "Falar com a Micronativa pelo WhatsApp" : undefined}
    onClick={() => trackEvent(message.context === "project" ? "whatsapp_project_click" : message.context === "quote" ? "whatsapp_quote_completed_click" : "whatsapp_click", { context: message.context, service: message.service })}
    className={cn(
      variant === "primary" && "btn-primary",
      variant === "secondary" && "btn-secondary",
      variant === "inline" && "inline-flex min-h-11 items-center gap-2 font-bold text-forest underline-offset-4 hover:underline",
      floating && "fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-full bg-forest text-white shadow-soft transition hover:-translate-y-1 hover:bg-forest-dark max-sm:bottom-4",
      className
    )}>
    <MessageCircle className="size-5" aria-hidden="true" />
    {!floating && label}
  </a>;
}
