"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Product, Category } from "@/types";

export default function KatalogPage() {
  const { profile, vipExpiresAt } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cat, setCat] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const vipActive =
    profile?.role === "vip" && !!vipExpiresAt && vipExpiresAt > Date.now();

  useEffect(() => {
    void getDocs(
      query(collection(getClientDb(), "categories"), where("active", "==", true))
    ).then((s) => {
      setCategories(
        s.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }))
          .sort((a, b) => a.order - b.order)
      );
    });
  }, []);

  async function load(reset = false) {
    setLoading(true);
    let q = query(
      collection(getClientDb(), "products"),
      where("active", "==", true),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    if (cat) {
      q = query(
        collection(getClientDb(), "products"),
        where("active", "==", true),
        where("categoryId", "==", cat),
        orderBy("createdAt", "desc"),
        limit(20)
      );
    }
    if (!reset && cursor) {
      q = query(q, startAfter(cursor));
    }
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Product, "id">),
    }));
    setProducts((prev) => (reset ? rows : [...prev, ...rows]));
    setCursor(snap.docs[snap.docs.length - 1] || null);
    setDone(snap.size < 20);
    setLoading(false);
  }

  useEffect(() => {
    setCursor(null);
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

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
        <div className="glass flex min-w-[200px] flex-1 items-center gap-2 rounded-full px-3 py-2">
          <span className="text-[var(--muted)]" aria-hidden>
            ⌕
          </span>
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cari produk Roblox…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            !cat ? "glass-chip" : "glass"
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              cat === c.id ? "glass-chip" : "glass"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => {
          const price = vipActive && p.vipPrice != null ? p.vipPrice : p.price;
          return (
            <Link
              key={p.id}
              href={`/produk/${p.id}`}
              className="product-card block"
            >
              {p.imageURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageURL}
                  alt={p.name}
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-sky-500/10 text-sm font-bold text-sky-600">
                  Roblox
                </div>
              )}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-bold leading-snug">{p.name}</h2>
                  {p.type === "vip" && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">{p.game}</p>
                <p className="mt-2 tabular-nums text-sm font-black text-sky-600">
                  Rp {Number(price).toLocaleString("id-ID")}
                  {vipActive && p.vipPrice != null && (
                    <span className="ml-2 text-[10px] font-semibold text-amber-600">
                      harga VIP
                    </span>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {!done && (
        <button
          type="button"
          className="btn-primary mx-auto block"
          disabled={loading}
          onClick={() => void load(false)}
        >
          {loading ? "Loading…" : "Muat lebih"}
        </button>
      )}
    </div>
  );
}
