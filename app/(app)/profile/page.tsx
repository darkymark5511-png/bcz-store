"use client";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { profile, user, vipExpiresAt, isAdmin } = useAuth();
  const role =
    isAdmin || profile?.role === "admin"
      ? "admin"
      : profile?.role === "vip" && vipExpiresAt && vipExpiresAt > Date.now()
        ? "vip"
        : profile?.role || "newbie";

  return (
    <div className="glass-card max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-black">Profile</h1>
      <p className="text-sm">
        <span className="text-[var(--muted)]">Username:</span> @
        {profile?.username || "—"}
      </p>
      <p className="text-sm">
        <span className="text-[var(--muted)]">Nama:</span>{" "}
        {profile?.displayName || "—"}
      </p>
      <p className="text-sm">
        <span className="text-[var(--muted)]">Role:</span> {role}
      </p>
      {role === "vip" && vipExpiresAt && (
        <p className="text-xs text-[var(--muted)]">
          VIP s/d {new Date(vipExpiresAt).toLocaleDateString("id-ID")}
        </p>
      )}
    </div>
  );
}
