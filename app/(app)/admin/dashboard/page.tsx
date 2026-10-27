"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type Stats = {
  totalUsers?: number;
  ordersToday?: number;
  pendingOrders?: number;
  revenueDelivered?: number;
  stockAvailable?: number;
};

export default function AdminDashboardPage() {
  const { user, isAdmin, profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const showAdmin = isAdmin || profile?.role === "admin";

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal stats");
        setStats(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "error");
      }
    })();
  }, [user]);

  if (!showAdmin) {
    return (
      <div className="glass-card p-6 text-sm">Akses admin ditolak.</div>
    );
  }

  const cards = [
    { label: "Users", value: stats?.totalUsers },
    { label: "Order hari ini", value: stats?.ordersToday },
    { label: "Pending", value: stats?.pendingOrders },
    { label: "Revenue delivered", value: stats?.revenueDelivered },
    { label: "Stok available", value: stats?.stockAvailable },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Admin Dashboard</h1>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-xs text-[var(--muted)]">{c.label}</p>
            <p className="mt-1 text-2xl font-black">
              {c.value == null ? "—" : Number(c.value).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {["order", "produk", "stok", "users", "vip"].map((s) => (
          <Link
            key={s}
            href={`/admin/${s}`}
            className="glass rounded-full px-4 py-2 text-sm font-semibold capitalize"
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
