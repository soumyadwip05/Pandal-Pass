import { NextResponse } from "next/server";
import { generatePass, normalizePrefs } from "@/lib/itinerary";
import { getProductData } from "@/lib/repository";
import { guardApiRequest } from "../../../src/lib/security.ts";

export async function POST(request: Request) {
  const blocked = guardApiRequest(request, {
    routeKey: "api:pass",
    limit: 40,
    windowMs: 60_000,
    enforceOrigin: true,
  });
  if (blocked) return blocked;

  const data = await getProductData();
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const prefs = normalizePrefs(data, body);
  return NextResponse.json(generatePass(data, prefs));
}
