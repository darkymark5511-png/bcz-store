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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="glass rounded-xl p-2 lg:hidden"
            aria-label="Open menu"
            title="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <Link href="/" className="text-lg font-black text-sky-600">
            BCZ Store
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="glass hidden rounded-xl p-2 lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
            onClick={toggleCollapse}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1">
        <aside
          className={`glass sticky top-[57px] hidden h-[calc(100vh-57px)] shrink-0 flex-col p-3 lg:flex ${
            collapsed ? "w-[72px]" : "w-64"
          }`}
        >
          <ProfileCard collapsed={collapsed} />
          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`nav-link ${active ? "active" : ""}`}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                title="Admin"
                className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
              >
                <ShieldCheck
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {!collapsed && <span>Admin</span>}
              </Link>
            )}
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            title="Logout"
            aria-label="Logout"
            className="mt-2 flex items-center gap-3 rounded-2xl bg-red-500/10 px-3 py-2 text-left text-sm font-semibold text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
          </button>
        </aside>

        <div
          className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!open}
        >
          <div
            className={`drawer-backdrop absolute inset-0 bg-black/40 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={() => setOpen(false)}
          />
          <aside
            className={`drawer-panel glass absolute left-0 top-0 flex h-full w-72 flex-col p-4 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ProfileCard collapsed={false} />
            <nav className="mt-4 flex-1 space-y-1">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${
                    pathname === href || (href !== "/" && pathname.startsWith(href))
                      ? "active"
                      : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
                >
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                  Admin
                </Link>
              )}
            </nav>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-3 rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600"
              aria-label="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
              Logout
            </button>
          </aside>
        </div>

        <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

function ProfileCard({ collapsed }: { collapsed: boolean }) {
  const { profile, vipExpiresAt } = useAuth();
  const initial = (profile?.username || "?").slice(0, 1).toUpperCase();

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/30 text-sm font-bold"
          title={profile?.username || "user"}
        >
          {initial}
        </div>
      </div>
    );
  }

  const vipActive =
    profile?.role === "vip" && vipExpiresAt && vipExpiresAt > Date.now();

  return (
    <div className="glass rounded-2xl p-3">
      <p className="truncate text-sm font-bold">
        {profile?.displayName || profile?.username || "User"}
      </p>
      <p className="truncate text-xs text-[var(--muted)]">
        @{profile?.username || "…"}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
        {profile?.role || "newbie"}
        {vipActive
          ? ` · s/d ${new Date(vipExpiresAt!).toLocaleDateString("id-ID")}`
          : ""}
      </p>
    </div>
  );
}
