import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export const SESSION_COOKIE = "bcz_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 5;

export type AuthedUser = {
  uid: string;
  email: string;
  token: DecodedIdToken;
};

export async function requireUser(): Promise<
  | { ok: true; user: AuthedUser }
  | { ok: false; response: NextResponse }
> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  try {
    const token = await adminAuth().verifySessionCookie(session, true);
    return {
      ok: true,
      user: {
        uid: token.uid,
        email: (token.email || "").toLowerCase(),
        token,
      },
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

export async function requireAdminFromBearer(
  authHeader: string | null
): Promise<
  | { ok: true; uid: string; email: string }
  | { ok: false; response: NextResponse }
> {
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const snap = await adminDb().doc(`admins/${decoded.uid}`).get();
    if (!snap.exists || snap.data()?.enabled !== true) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
    return {
      ok: true,
      uid: decoded.uid,
      email: (decoded.email || "").toLowerCase(),
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
