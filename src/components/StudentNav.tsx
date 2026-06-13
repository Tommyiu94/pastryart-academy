"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function StudentNav({ intakeName }: { intakeName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      pathname.startsWith(href)
        ? "bg-amber-700 text-white"
        : "text-amber-800 hover:bg-amber-100"
    }`;

  return (
    <header className="border-b border-amber-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-bold text-amber-900">Bakery Academy</p>
          <p className="text-xs text-amber-600">{intakeName}</p>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/curriculum" className={linkClass("/curriculum")}>
            Curriculum
          </Link>
          <Link href="/recipes" className={linkClass("/recipes")}>
            Recipes
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
