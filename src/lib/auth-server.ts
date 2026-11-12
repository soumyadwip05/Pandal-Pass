import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "./firebase-admin.ts";

export async function verifyFirebaseRequest(request: Request): Promise<DecodedIdToken | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return null;
  }
}
