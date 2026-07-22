type Bucket = { count: number; resetAt: number };
const memoryStore = new Map<string, Bucket>();

async function requestFingerprint(request: Request) {
  const raw = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function rateLimitRequest(request: Request, namespace: string, limit: number, windowMs: number) {
  const now = Date.now();
  const fingerprint = await requestFingerprint(request);
  const key = `${namespace}:${fingerprint}`;
  const bucket = memoryStore.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}

export const rateLimitNotice = "Proteção local por instância; configure um armazenamento compartilhado no ambiente de produção para limites globais.";
