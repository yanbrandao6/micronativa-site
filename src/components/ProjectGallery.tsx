"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/data/projects";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active !== null) close.current?.focus();
  }, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((active + 1) % images.length);
      if (event.key === "ArrowLeft") setActive((active - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, images.length]);

  return <>
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((image, index) => <button key={image.src + index} type="button" onClick={() => setActive(index)} className="group text-left">
        <span className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-navy-pale">
          <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
        </span>
        <span className="mt-2 block text-sm text-muted">{image.caption}</span>
      </button>)}
    </div>
    {active !== null && <div role="dialog" aria-modal="true" aria-label="Visualizador de imagens" className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-4">
      <button ref={close} onClick={() => setActive(null)} className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white text-ink" aria-label="Fechar visualizador"><X /></button>
      <div className="relative aspect-[4/3] w-full max-w-5xl"><img src={images[active].src} alt={images[active].alt} className="h-full w-full object-contain" /></div>
      <button onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-4 grid size-12 place-items-center rounded-full bg-white" aria-label="Imagem anterior"><ChevronLeft /></button>
      <button onClick={() => setActive((active + 1) % images.length)} className="absolute right-4 grid size-12 place-items-center rounded-full bg-white" aria-label="Próxima imagem"><ChevronRight /></button>
      <p className="absolute bottom-4 max-w-xl rounded-full bg-white px-5 py-2 text-sm">{images[active].caption}</p>
    </div>}
  </>;
}
