import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { company } from "@/config/company";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: { default: "Micronativa | Energia, Segurança e Automação", template: "%s | Micronativa" },
  description: "Soluções integradas em energia solar, CFTV, automação de portões e controle de acesso no Paraná.",
  icons: { icon: "/images/brand/micronativa-logo.jpg", apple: "/images/brand/micronativa-logo.jpg" },
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: company.name,
  url: company.siteUrl,
  telephone: company.phoneHref,
  email: company.email,
  areaServed: { "@type": "AdministrativeArea", name: "Paraná" },
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address,
    addressLocality: company.city,
    addressRegion: company.state,
    postalCode: company.postalCode,
    addressCountry: company.country,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={manrope.className}><AppChrome>{children}</AppChrome><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} /></body></html>;
}
