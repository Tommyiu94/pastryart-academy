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

  const [intakes, pastries] = query
    ? await Promise.all([
        prisma.intake.findMany({
          where: { name: { contains: query, mode: "insensitive" } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.pastry.findMany({
          where: { name: { contains: query, mode: "insensitive" } },
          include: { intake: true },
          orderBy: { name: "asc" },
        }),
      ])
    : [[], []];

  const hasResults = intakes.length > 0 || pastries.length > 0;

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
          {intakes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-amber-900">
                {t.adminSearch.intakesHeading}
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {intakes.map((intake) => (
                  <li key={intake.id}>
                    <Link
                      href={`/admin/intakes/${intake.id}`}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
                    >
                      <span className="font-medium text-amber-900">
                        {intake.name}
                        {intake.archived && (
                          <span className="ml-2 text-xs font-normal text-amber-500">
                            {t.adminIntakes.archived}
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-amber-600">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pastries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-amber-900">
                {t.adminSearch.pastriesHeading}
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {pastries.map((pastry) => (
                  <li key={pastry.id}>
                    <Link
                      href={`/admin/intakes/${pastry.intakeId}#pastry-${pastry.id}`}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
                    >
                      <span className="font-medium text-amber-900">{pastry.name}</span>
                      <span className="text-sm text-amber-600">
                        {pastry.intake.name} &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
