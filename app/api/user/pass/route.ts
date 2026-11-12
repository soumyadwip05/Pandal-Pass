import { NextResponse } from "next/server";
import { generatePass, normalizePrefs } from "@/lib/itinerary";
import { getProductData } from "@/lib/repository";
import { getSavedPassByUid, upsertSavedPassByUid } from "../../../../src/db/users.ts";
import { verifyFirebaseRequest } from "../../../../src/lib/auth-server.ts";
import { guardApiRequest } from "../../../../src/lib/security.ts";

export async function GET(request: Request) {
  const blocked = guardApiRequest(request, {
    routeKey: "api:user:pass:get",
    limit: 30,
    windowMs: 60_000,
    enforceOrigin: true,
  });
  if (blocked) return blocked;

  const decoded = await verifyFirebaseRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized: Missing or invalid token." }, { status: 401 });
  }

  try {
    const saved = await getSavedPassByUid(decoded.uid);
    const response = NextResponse.json({ saved });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[pandalpass] failed to fetch saved pass:", error);
    return NextResponse.json({ error: "Failed to load saved pass." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const blocked = guardApiRequest(request, {
    routeKey: "api:user:pass:put",
    limit: 30,
    windowMs: 60_000,
    enforceOrigin: true,
  });
  if (blocked) return blocked;

  const decoded = await verifyFirebaseRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized: Missing or invalid token." }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  try {
    const data = await getProductData();
    const rawPrefs =
      body && typeof body === "object" && "prefs" in body
        ? (body as { prefs: unknown }).prefs
        : body;
    const prefs = normalizePrefs(data, rawPrefs);
    const pass = generatePass(data, prefs);

    const email = decoded.email ?? `${decoded.uid}@users.pandalpass.local`;
    const displayName = typeof decoded.name === "string" ? decoded.name : null;
    const saved = await upsertSavedPassByUid(decoded.uid, email, displayName, prefs, pass);
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("[pandalpass] failed to save user pass:", error);
    return NextResponse.json({ error: "Failed to save route pass." }, { status: 500 });
  }
}
