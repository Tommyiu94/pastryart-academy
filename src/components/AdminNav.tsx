"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function AdminNav({ locale, t }: { locale: Locale; t: Dictionary["adminNav"] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/admin/search?q=${encodeURIComponent(q)}` : "/admin/search");
  }

  const linkClass = (href: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      pathname === href
        ? "bg-amber-700 text-white"
        : "text-amber-800 hover:bg-amber-100"
    }`;

  return (
    <header className="border-b border-amber-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <p className="text-lg font-bold text-amber-900">{t.title}</p>
        <form onSubmit={handleSearch} className="order-last w-full sm:order-none sm:w-56">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-md border border-amber-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </form>
        <nav className="flex items-center gap-2">
          <Link href="/admin" className={linkClass("/admin")}>
            {t.lessons}
          </Link>
          <Link href="/admin/recipes" className={linkClass("/admin/recipes")}>
            {t.recipes}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            {t.logout}
          </button>
          <LanguageToggle locale={locale} />
        </nav>
      </div>
    </header>
  );
}
