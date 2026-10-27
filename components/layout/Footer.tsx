"use client";

const FALLBACK_WA = "6281234567890";

export default function Footer() {
  return (
    <footer className="glass mt-auto px-4 py-6 text-center text-sm text-[var(--muted)]">
      <p>© BCZ Store — Roblox accounts &amp; items</p>
      <a
        href={`https://wa.me/${FALLBACK_WA}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block font-semibold text-sky-600"
      >
        WhatsApp Admin
      </a>
    </footer>
  );
}
