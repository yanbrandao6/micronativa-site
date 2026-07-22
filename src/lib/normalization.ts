export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 13);
}

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function normalizeProtocol(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(/^MN(\d{0,4})(\d{0,})$/);
  if (!match) return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 18);
  const [, year, sequence] = match;
  return ["MN", year, sequence].filter(Boolean).join("-").slice(0, 18);
}

export function formatProtocol(year: number, sequence: number) {
  return `MN-${year}-${String(sequence).padStart(6, "0")}`;
}

export function sanitizePlainText(value: string, maxLength = 5000) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}
