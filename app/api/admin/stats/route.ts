import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminFromBearer } from "@/lib/auth/requireUser";

export async function GET(req: NextRequest) {
  const auth = await requireAdminFromBearer(req.headers.get("authorization"));
  if (!auth.ok) return auth.response;

  const db = adminDb();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayStart = start.getTime();

  const [users, ordersToday, pending, delivered, stock] = await Promise.all([
    db.collection("users").count().get(),
    db.collection("orders").where("createdAt", ">=", dayStart).count().get(),
    db.collection("orders").where("status", "==", "pending").count().get(),
    db.collection("orders").where("status", "==", "delivered").get(),
    db.collection("accountStock").where("status", "==", "available").count().get(),
  ]);

  let revenue = 0;
  delivered.docs.forEach((d) => {
    revenue += Number(d.data().total) || 0;
  });

  return NextResponse.json({
    totalUsers: users.data().count,
    ordersToday: ordersToday.data().count,
    pendingOrders: pending.data().count,
    revenueDelivered: revenue,
    stockAvailable: stock.data().count,
  });
}
