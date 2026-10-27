import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const token = auth.slice(7);
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const snap = await adminDb().doc(`admins/${decoded.uid}`).get();
    if (!snap.exists || snap.data()?.enabled !== true) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
