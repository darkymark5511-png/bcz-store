"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/order", label: "Orders" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/stok", label: "Stok" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/vip", label: "VIP" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, profile } = useAuth();
  const pathname = usePathname();
  const show = isAdmin || profile?.role === "admin";

  if (!show) {
    return (
      <div className="glass-card p-6 text-sm">Akses admin ditolak.</div>
    );
  }

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              pathname.startsWith(l.href)
                ? "bg-sky-500/25 text-sky-700"
                : "glass"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
