import { NextResponse } from "next/server";

interface RateBucket {
  count: number;
  resetAt: number;
}

declare global {
  var _rateLimitStore: Map<string, RateBucket> | undefined;
}

const store: Map<string, RateBucket> = globalThis._rateLimitStore ?? new Map<string, RateBucket>();
if (!globalThis._rateLimitStore) {
  globalThis._rateLimitStore = store;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "local";
}

function pruneExpired(now: number) {
  if (store.size <= 1000) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  pruneExpired(now);
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterSec: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function extractForwardedHeaderHost(request: Request): string | null {
  const forwarded = request.headers.get("forwarded");
  if (!forwarded) return null;
  const match = forwarded.match(/(?:^|[;,\s])host=([^;,\s"]+|"[^"]+")/i);
  if (!match?.[1]) return null;
  return match[1].replace(/^"|"$/g, "").trim().toLowerCase() || null;
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim().toLowerCase();
  const rfcForwardedHost = extractForwardedHeaderHost(request);
  const host = request.headers.get("host")?.split(",")[0]?.trim().toLowerCase();

  if (forwardedHost && originHost === forwardedHost) return true;
  if (rfcForwardedHost && originHost === rfcForwardedHost) return true;
  if (host && originHost === host) return true;

  return false;
}

export function guardApiRequest(
  request: Request,
  options: {
    routeKey: string;
    limit: number;
    windowMs: number;
    enforceOrigin?: boolean;
  },
): NextResponse | null {
  if (options.enforceOrigin && !isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request forbidden." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`${options.routeKey}:${ip}`, options.limit, options.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfterSec),
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  return null;
}

export function withSecurityHeaders(response: NextResponse, rl?: RateLimitResult): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  if (rl) {
    response.headers.set("X-RateLimit-Limit", String(rl.limit));
    response.headers.set("X-RateLimit-Remaining", String(rl.remaining));
  }
  return response;
}
