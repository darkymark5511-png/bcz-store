"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@/types";

export default function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setLoading(true);
      setErr("");
      try {
        const snap = await getDocs(
          query(
            collection(getClientDb(), "orders"),
            where("userId", "==", user.uid)
          )
        );
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Order, "id">),
        }));
        rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(rows);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Gagal muat order");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Order Saya</h1>
      {loading && <p className="text-sm text-[var(--muted)]">Memuat…</p>}
      {err && <p className="text-xs text-red-500">{err}</p>}
      {!loading && orders.length === 0 && !err && (
        <div className="glass-card p-6 text-sm text-[var(--muted)]">
          Belum ada order.
        </div>
      )}
      {orders.map((o) => (
        <div key={o.id} className="glass-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs">{o.id}</p>
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase">
              {o.status}
            </span>
          </div>
          <ul className="mt-2 text-sm">
            {(o.items || []).map((it, i) => (
              <li key={i}>
                {it.name} × {it.qty} — Rp{" "}
                {Number((it.price || 0) * (it.qty || 1)).toLocaleString("id-ID")}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm font-bold">
            Total Rp {Number(o.total || 0).toLocaleString("id-ID")}
          </p>
          {o.status === "delivered" && o.deliveryPayload && (
            <pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-3 text-xs dark:bg-white/5">
              {o.deliveryPayload}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
