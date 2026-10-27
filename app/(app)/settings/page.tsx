"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile]);

  async function save() {
    setMsg("");
    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Tersimpan" : data.error || "Gagal");
  }

  return (
    <div className="glass-card max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-black">Pengaturan</h1>
      <div className="flex items-center justify-between">
        <span className="text-sm">Tema</span>
        <ThemeToggle />
      </div>
      <label className="block text-xs font-semibold">
        Username
        <input
          className="glass mt-1 w-full rounded-2xl px-4 py-3 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
      </label>
      <label className="block text-xs font-semibold">
        Display name
        <input
          className="glass mt-1 w-full rounded-2xl px-4 py-3 text-sm"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </label>
      <button type="button" className="btn-primary" onClick={() => void save()}>
        Simpan
      </button>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}
