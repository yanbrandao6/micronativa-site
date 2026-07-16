import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { company } from "@/config/company";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Micronativa | Energia Solar, CFTV e Automação", template: "%s | Micronativa" },
  description: "Projetos e instalações de energia solar, câmeras de segurança, controle de acesso e automação de portões para residências e empresas.",
  metadataBase: new URL(company.siteUrl),
  icons: {
    icon: "/images/brand/micronativa-logo.jpg",
    shortcut: "/images/brand/micronativa-logo.jpg",
    apple: "/images/brand/micronativa-logo.jpg",
  },
  robots: { index: true, follow: true },
};

const localBusiness = {
  "@context": "https://schema.org", "@type": "LocalBusiness", name: company.name,
  description: "Soluções integradas em energia solar, segurança e automação.",
  telephone: company.phoneHref, email: company.email, areaServed: company.serviceArea,
  address: { "@type": "PostalAddress", addressLocality: company.city, addressRegion: company.state, streetAddress: company.address },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={manrope.className}><SiteHeader /><main id="conteudo">{children}</main><SiteFooter /><WhatsAppButton context="home" variant="floating" /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} /></body></html>;
}
