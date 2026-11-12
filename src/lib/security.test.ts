import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, getClientIp, isAllowedOrigin } from "./security.ts";

test("getClientIp extracts first forwarded IP or falls back cleanly", () => {
  const req1 = new Request("http://localhost:3000/api/data", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  });
  assert.equal(getClientIp(req1), "203.0.113.10");

  const req2 = new Request("http://localhost:3000/api/data");
  assert.equal(getClientIp(req2), "local");
});

test("checkRateLimit blocks requests exceeding window limit and resets after window", () => {
  const key = `test-rl-${Date.now()}`;
  const t0 = 1_000_000;

  assert.equal(checkRateLimit(key, 2, 10_000, t0).allowed, true);
  assert.equal(checkRateLimit(key, 2, 10_000, t0 + 100).allowed, true);

  const blocked = checkRateLimit(key, 2, 10_000, t0 + 200);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSec >= 1);

  const afterReset = checkRateLimit(key, 2, 10_000, t0 + 10_001);
  assert.equal(afterReset.allowed, true);
});

test("isAllowedOrigin permits same-origin and blocks mismatched origins", () => {
  const sameHost = new Request("https://example.run.app/api/pass", {
    headers: {
      origin: "https://example.run.app",
      host: "example.run.app",
    },
  });
  assert.equal(isAllowedOrigin(sameHost), true);

  const forwardedMatch = new Request("http://localhost:3000/api/pass", {
    headers: {
      origin: "https://ais-dev-demo.asia-east1.run.app",
      "x-forwarded-host": "ais-dev-demo.asia-east1.run.app",
      host: "localhost:3000",
    },
  });
  assert.equal(isAllowedOrigin(forwardedMatch), true);

  const rfcForwarded = new Request("http://localhost:3000/api/pass", {
    headers: {
      origin: "https://ais-dev-demo.asia-east1.run.app",
      forwarded: 'for=198.51.100.1;host="ais-dev-demo.asia-east1.run.app";proto=https',
      host: "localhost:3000",
    },
  });
  assert.equal(isAllowedOrigin(rfcForwarded), true);

  const spoofedReferer = new Request("http://localhost:3000/api/pass", {
    headers: {
      origin: "https://evil.attacker.com",
      referer: "https://evil.attacker.com/attack.html",
      host: "localhost:3000",
    },
  });
  assert.equal(isAllowedOrigin(spoofedReferer), false);

  const evilOrigin = new Request("https://example.run.app/api/pass", {
    headers: {
      origin: "https://evil.attacker.com",
      host: "example.run.app",
    },
  });
  assert.equal(isAllowedOrigin(evilOrigin), false);
});
