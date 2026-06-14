"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export default function LanguageToggle({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const baseClass = "rounded-md px-2 py-1 text-sm font-medium";
  const activeClass = "bg-amber-700 text-white";
  const inactiveClass = "text-amber-800 hover:bg-amber-100";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`${baseClass} ${locale === "en" ? activeClass : inactiveClass}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={`${baseClass} ${locale === "zh" ? activeClass : inactiveClass}`}
      >
        中文
      </button>
    </div>
  );
}
