"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  LayoutGrid,
  ReceiptText,
  MessageCircle,
  Mail,
  Package,
  Search,
  Target,
  Settings,
  UserRound,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Footer from "@/components/layout/Footer";

const NAV = [
  { href: "/", label: "Beranda", Icon: House },
  { href: "/katalog", label: "Katalog", Icon: LayoutGrid },
  { href: "/order", label: "Order Saya", Icon: ReceiptText },
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/pesan", label: "Pesan", Icon: Mail },
  { href: "/box", label: "Box", Icon: Package },
  { href: "/cari-akun", label: "Cari Akun", Icon: Search },
  { href: "/misi", label: "Misi", Icon: Target },
  { href: "/settings", label: "Pengaturan", Icon: Settings },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showAdmin = isAdmin || profile?.role === "admin";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="glass rounded-xl p-2 lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={2} aria-hidden={true} />
          </button>
          <Link href="/" className="text-lg font-black text-sky-600">
            BCZ Store
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="glass rounded-xl p-2 text-red-600"
            aria-label="Logout"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden={true} />
          </button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-3 py-4">
        <aside className="glass hidden w-64 shrink-0 flex-col rounded-3xl p-3 lg:flex">
          <nav className="space-y-1">
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                    active
                      ? "bg-sky-500/20 font-bold text-sky-600"
                      : "hover:bg-white/20"
                  }`}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                    aria-hidden={true}
                  />
                  {label}
                </Link>
              );
            })}
            {showAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm"
              >
                <ShieldCheck
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                  aria-hidden={true}
                />
                Admin
              </Link>
            )}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <aside className="glass absolute left-0 top-0 flex h-full w-72 flex-col p-4">
            <button
              type="button"
              className="mb-3 self-end"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden={true} />
            </button>
            <nav className="space-y-1">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm"
                  onClick={() => setOpen(false)}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                    aria-hidden={true}
                  />
                  {label}
                </Link>
              ))}
              {showAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm"
                  onClick={() => setOpen(false)}
                >
                  <ShieldCheck
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                    aria-hidden={true}
                  />
                  Admin
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
