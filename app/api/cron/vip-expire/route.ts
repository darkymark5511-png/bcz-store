import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const db = adminDb();
  const expired = await db
    .collection("vipMembers")
    .where("expiresAt", "<", now)
    .limit(200)
    .get();

  let updated = 0;
  for (const doc of expired.docs) {
    const uid = doc.id;
    await db.runTransaction(async (tx) => {
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await tx.get(userRef);
      const role = userSnap.data()?.role;
      if (role === "vip") {
        tx.set(userRef, { role: "newbie", updatedAt: now }, { merge: true });
      }
      tx.delete(doc.ref);
      const auditRef = db.collection("auditLogs").doc();
      tx.set(auditRef, {
        actorUid: "system:cron",
        action: "vip.expire",
        targetPath: `vipMembers/${uid}`,
        before: doc.data(),
        after: { role: "newbie" },
        createdAt: now,
      });
    });
    updated++;
  }

  return NextResponse.json({ ok: true, expired: updated });
}
