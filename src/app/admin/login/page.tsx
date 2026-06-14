import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import LanguageToggle from "@/components/LanguageToggle";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-amber-50 px-6">
      <LanguageToggle locale={locale} className="absolute right-4 top-4" />
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-amber-900">{t.adminLogin.title}</h1>
        <AdminLoginForm t={t.adminLogin} />
      </div>
    </div>
  );
}
