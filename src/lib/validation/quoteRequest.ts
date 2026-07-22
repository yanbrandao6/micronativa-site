import { z } from "zod";
import { normalizeEmail, normalizePhone, sanitizePlainText } from "@/lib/normalization";

export const quoteServiceSchema = z.enum([
  "energia-solar", "cftv-seguranca", "automacao-portoes",
  "controle-acesso", "projeto-integrado", "manutencao",
]);

const plainText = (minimum: number, maximum: number) => z.string()
  .transform((value) => sanitizePlainText(value, maximum))
  .pipe(z.string().min(minimum).max(maximum))
  .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), "Use somente texto simples.");

export const quoteRequestPayloadSchema = z.object({
  idempotencyKey: z.string().uuid(),
  service: quoteServiceSchema,
  additionalServices: z.array(quoteServiceSchema).max(6).default([]),
  propertyType: plainText(2, 80),
  purpose: plainText(2, 80),
  city: plainText(2, 120),
  state: z.literal("PR"),
  projectDetails: z.record(z.string().max(80), z.union([z.string().max(2000), z.boolean()])).default({}),
  customer: z.object({
    name: plainText(3, 160),
    phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^\d{10,13}$/)),
    whatsapp: z.string().transform(normalizePhone).pipe(z.string().regex(/^\d{10,13}$/).or(z.literal(""))),
    email: z.string().transform(normalizeEmail).pipe(z.string().email().max(254)),
  }),
  preferredContactMethod: z.enum(["WhatsApp", "Telefone", "E-mail"]),
  privacyConsent: z.literal(true),
  sourcePage: plainText(1, 100),
  projectReference: plainText(1, 160).optional(),
  website: z.string().max(0).optional().default(""),
});

export const protocolLookupSchema = z.object({
  protocol: z.string().trim().toUpperCase().regex(/^MN-\d{4}-\d{6,}$/),
  email: z.string().transform(normalizeEmail).pipe(z.string().email().max(254)),
});

export const attachmentMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_ATTACHMENT_FILES = 6;
export const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024;

const mimeExtensions: Record<(typeof attachmentMimeTypes)[number], readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
};

export function validateAttachment(file: Pick<File, "name" | "size" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!attachmentMimeTypes.includes(file.type as (typeof attachmentMimeTypes)[number])) return { valid: false as const, error: "Formato não permitido." };
  if (!mimeExtensions[file.type as (typeof attachmentMimeTypes)[number]].includes(extension)) return { valid: false as const, error: "A extensão não corresponde ao tipo do arquivo." };
  if (file.size < 1 || file.size > MAX_ATTACHMENT_SIZE) return { valid: false as const, error: "Cada arquivo deve ter no máximo 8 MB." };
  return { valid: true as const, extension };
}

export async function hasValidFileSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (file.type === "application/pdf") return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  return false;
}

export type QuoteRequestPayload = z.infer<typeof quoteRequestPayloadSchema>;
