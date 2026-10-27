"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SetupPage() {
  const { user, profile, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  if (!loading && !user) {
    router.replace("/login");
  }
  if (!loading && profile?.username) {
    router.replace("/");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      router.replace("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal setup");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card w-full max-w-md p-8 transition duration-300">
      <h1 className="text-xl font-black">Setup profil</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Pilih username unik (huruf kecil, angka, underscore).
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-left text-xs font-semibold">
          Username
          <input
            className="glass mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            pattern="[a-z0-9_]{3,20}"
            minLength={3}
            maxLength={20}
            required
            placeholder="contoh_user"
          />
        </label>
        <label className="block text-left text-xs font-semibold">
          Display name
          <input
            className="glass mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="Nama tampilan"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Menyimpan…" : "Simpan & masuk"}
        </button>
        {err && <p className="text-xs text-red-500">{err}</p>}
      </form>
    </div>
  );
}
