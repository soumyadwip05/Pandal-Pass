import { NextResponse } from "next/server";
import { getOrCreateUser } from "../../../../src/db/users.ts";
import { verifyFirebaseRequest } from "../../../../src/lib/auth-server.ts";
import { guardApiRequest } from "../../../../src/lib/security.ts";

export async function POST(request: Request) {
  const blocked = guardApiRequest(request, {
    routeKey: "api:auth:session",
    limit: 20,
    windowMs: 60_000,
    enforceOrigin: true,
  });
  if (blocked) return blocked;

  const decoded = await verifyFirebaseRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized: Missing or invalid token." }, { status: 401 });
  }

  try {
    const email = decoded.email ?? `${decoded.uid}@users.pandalpass.local`;
    const displayName = typeof decoded.name === "string" ? decoded.name : null;
    const user = await getOrCreateUser(decoded.uid, email, displayName);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[pandalpass] session sync failed:", error);
    return NextResponse.json({ error: "Failed to sync user account." }, { status: 500 });
  }
}
