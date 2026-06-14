"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function AdminNav({ locale, t }: { locale: Locale; t: Dictionary["adminNav"] }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      pathname === href
        ? "bg-amber-700 text-white"
        : "text-amber-800 hover:bg-amber-100"
    }`;

  return (
    <header className="border-b border-amber-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <p className="text-lg font-bold text-amber-900">{t.title}</p>
        <nav className="flex items-center gap-2">
          <Link href="/admin" className={linkClass("/admin")}>
            {t.intakes}
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
