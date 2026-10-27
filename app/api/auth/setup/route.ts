import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/auth/requireUser";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: { username?: string; displayName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const username = (body.username || "").trim().toLowerCase();
  const displayName = (body.displayName || username).trim().slice(0, 40);

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      {
        error:
          "Username 3–20 karakter, huruf kecil, angka, underscore saja",
      },
      { status: 400 }
    );
  }

  const db = adminDb();
  const unameRef = db.doc(`usernames/${username}`);
  const userRef = db.doc(`users/${auth.user.uid}`);

  try {
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(unameRef);
      if (existing.exists && existing.data()?.uid !== auth.user.uid) {
        throw new Error("TAKEN");
      }
      const userSnap = await tx.get(userRef);
      const prev = userSnap.data() || {};
      if (prev.username && prev.username !== username) {
        const oldRef = db.doc(`usernames/${prev.username}`);
        const oldSnap = await tx.get(oldRef);
        if (oldSnap.exists && oldSnap.data()?.uid === auth.user.uid) {
          tx.delete(oldRef);
        }
      }
      tx.set(unameRef, { uid: auth.user.uid });
      tx.set(
        userRef,
        {
          uid: auth.user.uid,
          email: auth.user.email,
          username,
          displayName,
          role: prev.role || "newbie",
          photoURL: prev.photoURL || null,
          updatedAt: Date.now(),
          createdAt: prev.createdAt || Date.now(),
        },
        { merge: true }
      );
    });
    return NextResponse.json({ ok: true, username, displayName });
  } catch (e) {
    if (e instanceof Error && e.message === "TAKEN") {
      return NextResponse.json(
        { error: "Username sudah dipakai" },
        { status: 409 }
      );
    }
    console.error("[setup]", e);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
