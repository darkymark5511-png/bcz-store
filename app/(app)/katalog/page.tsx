"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@/types";

export default function KatalogPage() {
  const { profile, vipExpiresAt } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const vipActive =
    profile?.role === "vip" && !!vipExpiresAt && vipExpiresAt > Date.now();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(getClientDb(), "products"));
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
          .filter((p) => p.active !== false);
        setProducts(rows);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Gagal muat produk");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.game?.toLowerCase().includes(s) ||
      p.slug?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black">Katalog</h1>
        <div className="search-pill min-w-[200px] flex-1">
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cari produk Roblox…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {loading && <p className="text-sm text-[var(--muted)]">Memuat…</p>}
      {err && <p className="text-sm text-red-500">{err}</p>}
      {!loading && filtered.length === 0 && (
        <div className="glass-card p-6 text-sm text-[var(--muted)]">
          Belum ada produk.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const price =
            vipActive && p.vipPrice != null ? p.vipPrice : p.price;
          return (
            <Link
              key={p.id}
              href={`/produk/${p.id}`}
              className="glass-card block overflow-hidden transition hover:-translate-y-0.5"
            >
              <div className="flex h-36 items-center justify-center bg-sky-500/10 text-sky-600">
                Roblox
              </div>
              <div className="p-4">
                <h2 className="font-bold">{p.name || "Produk"}</h2>
                <p className="text-xs text-[var(--muted)]">{p.game}</p>
                <p className="mt-2 text-sm font-black text-sky-600">
                  Rp {Number(price || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
