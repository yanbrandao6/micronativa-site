import { quoteStatuses, type QuoteRequestStatus } from "@/config/quoteStatuses";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: QuoteRequestStatus; className?: string }) {
  const config = quoteStatuses[status];
  return <span className={cn("inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-extrabold", config.badgeClass, className)}>{config.label}</span>;
}
