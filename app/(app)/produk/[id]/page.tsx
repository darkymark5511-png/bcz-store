"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { createOrder } from "@/lib/api-client";
import type { Product } from "@/types";

export default function ProdukDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, vipExpiresAt } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const vipActive =
    profile?.role === "vip" && !!vipExpiresAt && vipExpiresAt > Date.now();

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const snap = await getDoc(doc(getClientDb(), "products", id));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...(snap.data() as Omit<Product, "id">) });
      }
    })();
  }, [id]);

  async function buy() {
    if (!product) return;
    setBusy(true);
    setMsg("");
    try {
      const data = await createOrder({ productId: product.id });
      setMsg(`Order dibuat: ${data.id}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal order");
    } finally {
      setBusy(false);
    }
  }

  if (!product) {
    return <p className="text-sm text-[var(--muted)]">Memuat…</p>;
  }

  const price =
    vipActive && product.vipPrice != null ? product.vipPrice : product.price;

  return (
    <div className="glass-card max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-black">{product.name}</h1>
      <p className="text-sm text-[var(--muted)]">{product.game}</p>
      <p className="text-sm">{product.description}</p>
      <p className="text-xl font-black text-sky-600">
        Rp {Number(price || 0).toLocaleString("id-ID")}
      </p>
      <button
        type="button"
        className="btn-primary"
        disabled={busy}
        onClick={() => void buy()}
      >
        {busy ? "Memproses…" : "Pesan"}
      </button>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}
