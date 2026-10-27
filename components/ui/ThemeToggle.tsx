"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefer =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", prefer);
    setDark(prefer);
  }, []);

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
      className={`glass rounded-2xl p-2.5 text-sm ${className}`}
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
        setDark(next);
      }}
    >
      {dark ? (
        <Moon className="h-5 w-5" strokeWidth={2} aria-hidden={true} />
      ) : (
        <Sun className="h-5 w-5" strokeWidth={2} aria-hidden={true} />
      )}
    </button>
  );
}
