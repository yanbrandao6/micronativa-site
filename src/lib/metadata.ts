import type { Metadata } from "next";
import { company } from "@/config/company";

export function pageMetadata(title: string, description: string, path = ""): Metadata {
  const fullTitle = title.includes("Micronativa") ? title : title + " | Micronativa";
  const url = company.siteUrl + path;
  return {
    title: fullTitle,
    description,
    metadataBase: new URL(company.siteUrl),
    alternates: { canonical: url },
    openGraph: { title: fullTitle, description, url, siteName: company.name, locale: "pt_BR", type: "website" },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
