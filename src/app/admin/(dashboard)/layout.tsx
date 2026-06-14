import AdminNav from "@/components/AdminNav";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-amber-50">
      <AdminNav locale={locale} t={t.adminNav} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
