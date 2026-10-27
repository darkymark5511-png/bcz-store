import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/auth/requireUser";

const bodySchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId } = parsed.data;
  const qty = parsed.data.qty ?? 1;
  const db = adminDb();

  const productSnap = await db.doc(`products/${productId}`).get();
  if (!productSnap.exists) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }
  const product = productSnap.data()!;
  if (product.active === false) {
    return NextResponse.json({ error: "Produk nonaktif" }, { status: 400 });
  }

  const userSnap = await db.doc(`users/${auth.user.uid}`).get();
  const user = userSnap.data() || {};
  const vipSnap = await db.doc(`vipMembers/${auth.user.uid}`).get();
  const vipActive =
    user.role === "vip" &&
    typeof vipSnap.data()?.expiresAt === "number" &&
    vipSnap.data()!.expiresAt > Date.now();

  const unit =
    vipActive && product.vipPrice != null
      ? Number(product.vipPrice)
      : Number(product.price);
  const total = unit * qty;
  const now = Date.now();

  const orderRef = db.collection("orders").doc();
  await orderRef.set({
    userId: auth.user.uid,
    username: user.username || "",
    items: [
      {
        productId,
        name: product.name || "Produk",
        price: unit,
        qty,
        type: product.type || "standard",
        durationDays: product.durationDays,
      },
    ],
    total,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    ok: true,
    id: orderRef.id,
    orderId: orderRef.id,
    price: total,
    status: "pending",
  });
}
