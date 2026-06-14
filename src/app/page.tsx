import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import LanguageToggle from "@/components/LanguageToggle";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-amber-50 px-6">
      <LanguageToggle locale={locale} className="absolute right-4 top-4" />
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-amber-900">{t.common.appName}</h1>
        <p className="mt-2 text-amber-700">{t.home.subtitle}</p>

        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-amber-700 px-6 py-3 font-medium text-white shadow hover:bg-amber-800"
          >
            {t.home.studentLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
