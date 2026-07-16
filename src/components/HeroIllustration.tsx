export function HeroIllustration() {
  return <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-4xl border border-white/80 bg-white shadow-soft" role="img" aria-label="Propriedade inteligente com energia solar, câmeras, portão automatizado e controle de acesso">
    <div className="grid-pattern absolute inset-0" />
    <svg viewBox="0 0 720 540" className="relative h-full w-full" aria-hidden="true">
      <defs><linearGradient id="ground" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#DDEDE4"/><stop offset="1" stopColor="#DDE9F2"/></linearGradient></defs>
      <path d="M55 418 350 240l315 165-307 96z" fill="url(#ground)"/>
      <path d="m178 333 176-112 176 96v129l-174 49-178-61z" fill="#fff" stroke="#173F5F" strokeWidth="5"/>
      <path d="m159 336 193-123 199 108-22 31-177-96-175 111z" fill="#173F5F"/>
      <g fill="#DDE9F2" stroke="#E8C547" strokeWidth="3"><path d="m247 293 101-62 45 24-100 63z"/><path d="m303 321 101-62 46 25-101 62z"/></g>
      <g stroke="#173F5F" strokeWidth="2" opacity=".55"><path d="m267 281 46 25m-22-39 46 25m-11-39 45 25m-49 30 101-62m-74 80 101-62"/></g>
      <rect x="379" y="352" width="75" height="111" rx="5" fill="#DDE9F2"/><rect x="207" y="373" width="106" height="72" rx="4" fill="#DDE9F2"/>
      <path d="M483 412h116v56H483z" fill="#fff" stroke="#104A32" strokeWidth="5"/><path d="M498 417v46m25-46v46m25-46v46m25-46v46" stroke="#176B45" strokeWidth="4"/>
      <path d="M570 414v-53" stroke="#173F5F" strokeWidth="6"/><rect x="550" y="340" width="42" height="27" rx="8" fill="#173F5F"/><circle cx="580" cy="353" r="5" fill="#E8C547"/>
      <rect x="462" y="383" width="19" height="39" rx="5" fill="#104A32"/><circle cx="471.5" cy="397" r="4" fill="#E8C547"/>
      <g fill="none" stroke="#176B45" strokeWidth="3" strokeDasharray="7 7"><path d="M576 350C630 288 633 224 570 187"/><path d="M470 394C594 363 612 287 570 187"/><path d="M374 272C450 183 508 176 570 187"/></g>
      <rect x="524" y="115" width="90" height="142" rx="18" fill="#fff" stroke="#173F5F" strokeWidth="6"/><rect x="538" y="140" width="62" height="91" rx="8" fill="#DDEDE4"/><circle cx="569" cy="242" r="5" fill="#176B45"/>
      <path d="m550 192 17-17 12 12 15-22" fill="none" stroke="#176B45" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="115" cy="111" r="35" fill="#E8C547"/><g stroke="#E8C547" strokeWidth="5"><path d="M115 55V29m0 164v-26M59 111H33m164 0h-26M75 71 56 52m118 118-19-19m19-80 19-19M75 151l-19 19"/></g>
    </svg>
    <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 p-4 shadow-lg"><p className="text-xs font-bold uppercase tracking-wider text-forest">Ecossistema integrado</p><p className="mt-1 text-sm font-bold text-navy">Energia • Segurança • Automação</p></div>
  </div>;
}
