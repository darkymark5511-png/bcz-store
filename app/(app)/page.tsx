import Link from "next/link";
import { LayoutGrid, ReceiptText, ShieldCheck } from "lucide-react";

export default function BerandaPage() {
  return (
    <div className="space-y-5">
      <section className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
          BCZ Store
        </p>
        <h1 className="mt-2 max-w-lg text-2xl font-black tracking-tight sm:text-3xl">
          Katalog Roblox — cepat scan, order, terima akun.
        </h1>
        <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
          Akun, item, limited. Harga VIP otomatis kalau role kamu VIP.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/katalog" className="btn-primary">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} aria-hidden />
            Katalog
          </Link>
          <Link href="/order" className="btn-ghost">
            <ReceiptText className="h-4 w-4" strokeWidth={2} aria-hidden />
            Order saya
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            href: "/katalog",
            title: "Belanja",
            body: "Filter kategori + search di katalog.",
            Icon: LayoutGrid,
          },
          {
            href: "/order",
            title: "Lacak order",
            body: "Status pending → delivered + payload akun.",
            Icon: ReceiptText,
          },
          {
            href: "/admin/dashboard",
            title: "Admin",
            body: "Stok, approve, kirim — role admin saja.",
            Icon: ShieldCheck,
          },
        ].map(({ href, title, body, Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass-card block p-4 transition hover:-translate-y-0.5"
          >
            <Icon
              className="h-5 w-5 text-sky-600 dark:text-sky-400"
              strokeWidth={2}
              aria-hidden
            />
            <p className="mt-2 text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
