import { eq } from "drizzle-orm";
import { db } from "./index.ts";
import { userPasses, users } from "./schema.ts";
import type { Pass, Prefs } from "../../lib/types.ts";

export interface SavedUserRecord {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
}

export interface SavedPassRecord {
  prefs: Prefs;
  pass: Pass;
  updatedAt: string;
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null,
): Promise<SavedUserRecord> {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName !== undefined ? { displayName } : {}),
        },
      })
      .returning({
        id: users.id,
        uid: users.uid,
        email: users.email,
        displayName: users.displayName,
      });

    return result[0];
  } catch (error) {
    console.error("Database query failed (getOrCreateUser):", error);
    throw new Error("Could not sync account record.", { cause: error });
  }
}

export async function getSavedPassByUid(uid: string): Promise<SavedPassRecord | null> {
  try {
    const rows = await db
      .select({
        prefs: userPasses.prefs,
        pass: userPasses.pass,
        updatedAt: userPasses.updatedAt,
      })
      .from(userPasses)
      .innerJoin(users, eq(userPasses.userId, users.id))
      .where(eq(users.uid, uid))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      prefs: row.prefs,
      pass: row.pass,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Database query failed (getSavedPassByUid):", error);
    throw new Error("Could not load saved pass.", { cause: error });
  }
}

export async function upsertSavedPassByUid(
  uid: string,
  email: string,
  displayName: string | null | undefined,
  prefs: Prefs,
  pass: Pass,
): Promise<SavedPassRecord> {
  try {
    const user = await getOrCreateUser(uid, email, displayName);
    const now = new Date();
    const result = await db
      .insert(userPasses)
      .values({
        userId: user.id,
        prefs,
        pass,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userPasses.userId,
        set: {
          prefs,
          pass,
          updatedAt: now,
        },
      })
      .returning({
        prefs: userPasses.prefs,
        pass: userPasses.pass,
        updatedAt: userPasses.updatedAt,
      });

    return {
      prefs: result[0].prefs,
      pass: result[0].pass,
      updatedAt: result[0].updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Database query failed (upsertSavedPassByUid):", error);
    throw new Error("Could not save route pass.", { cause: error });
  }
}
