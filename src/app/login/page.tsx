import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import LanguageToggle from "@/components/LanguageToggle";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-amber-50 px-6">
      <LanguageToggle locale={locale} className="absolute right-4 top-4" />
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-amber-900">{t.studentLogin.title}</h1>
        <p className="mt-1 text-sm text-amber-700">{t.studentLogin.subtitle}</p>
        <LoginForm t={t.studentLogin} />
      </div>
    </div>
  );
}
