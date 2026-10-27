"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { loginWithGoogle, user, profile, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  if (!loading && user) {
    if (profile?.username) router.replace("/");
    else router.replace("/setup");
  }

  async function onLogin() {
    setBusy(true);
    setErr("");
    try {
      await loginWithGoogle();
      router.replace("/setup");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card w-full max-w-md p-8 text-center transition duration-300">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-600">
        <ShoppingBag className="h-8 w-8" strokeWidth={2} aria-hidden={true} />
      </div>
      <h1 className="text-2xl font-black tracking-tight">BCZ Store</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Toko akun & item Roblox. Masuk dengan Google.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onLogin()}
        className="btn-primary mt-8 w-full disabled:opacity-60"
      >
        {busy ? "Menghubungkan…" : "Masuk Dengan Google"}
      </button>
      {err && <p className="mt-3 text-xs text-red-500">{err}</p>}
    </div>
  );
}
