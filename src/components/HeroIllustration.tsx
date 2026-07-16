export function HeroIllustration() {
  return (
    <figure className="group relative mx-auto aspect-[3/2] w-full max-w-3xl overflow-hidden rounded-4xl border border-white/80 bg-white shadow-soft">
      <img
        src="/images/isometric/hero-smart-property.webp"
        alt="Propriedade inteligente com energia solar, câmeras, portão automatizado e controle de acesso"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
        decoding="async"
        fetchPriority="high"
      />
      <figcaption className="absolute bottom-4 left-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:bottom-6 sm:left-6">
        <p className="text-xs font-bold uppercase tracking-wider text-forest">Ecossistema integrado</p>
        <p className="mt-1 text-sm font-bold text-navy">Energia • Segurança • Automação</p>
      </figcaption>
    </figure>
  );
}
