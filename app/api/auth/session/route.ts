import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/requireUser";

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

async function rateLimit(ip: string): Promise<boolean> {
  const key = `rateLimits/auth_session_${ip.replace(/[^\w.-]/g, "_")}`;
  const ref = adminDb().doc(key);
  const now = Date.now();
  try {
    await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() as
        | { windowStart?: number; count?: number }
        | undefined;
      if (!data || now - (data.windowStart || 0) > RATE_WINDOW_MS) {
        tx.set(ref, { windowStart: now, count: 1 });
        return;
      }
      if ((data.count || 0) >= RATE_MAX) {
        throw new Error("RATE");
      }
      tx.update(ref, { count: (data.count || 0) + 1 });
    });
    return true;
  } catch (e) {
    if (e instanceof Error && e.message === "RATE") return false;
    return true;
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!(await rateLimit(ip))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(body.idToken);
    const sessionCookie = await adminAuth().createSessionCookie(body.idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    const res = NextResponse.json({
      ok: true,
      uid: decoded.uid,
      email: decoded.email,
    });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (e) {
    console.error("[session]", e);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
