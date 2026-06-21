import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const pastries = query
    ? await prisma.pastry.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        orderBy: { name: "asc" },
      })
    : [];

  const hasResults = pastries.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900">{t.adminSearch.title}</h1>
      <p className="mt-1 text-amber-700">{t.adminSearch.subtitle}</p>

      {!query ? (
        <p className="mt-8 text-amber-700">{t.adminSearch.empty}</p>
      ) : !hasResults ? (
        <p className="mt-8 text-amber-700">
          {t.adminSearch.noResults.replace("{query}", query)}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          <div>
            <h2 className="text-lg font-semibold text-amber-900">
              {t.adminSearch.pastriesHeading}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {pastries.map((pastry) => (
                <li key={pastry.id}>
                  <Link
                    href={`/admin#pastry-${pastry.id}`}
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
                  >
                    <span className="font-medium text-amber-900">{pastry.name}</span>
                    <span className="text-sm text-amber-600">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
