import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, align = "left" }: { eyebrow?: string; title: string; description?: string; align?: "left" | "center" }) {
  return <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
    {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
    <h2 className="section-title">{title}</h2>
    {description && <p className="body-large mt-5">{description}</p>}
  </div>;
}
