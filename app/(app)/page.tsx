import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black">BCZ Store</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Toko akun &amp; item Roblox.
        </p>
        <Link href="/katalog" className="btn-primary mt-6 inline-block">
          Lihat Katalog
        </Link>
      </div>
    </div>
  );
}
