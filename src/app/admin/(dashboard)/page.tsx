import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import FolderIcon from "@/components/FolderIcon";
import NewIntakeForm from "./NewIntakeForm";

export const dynamic = "force-dynamic";

export default async function AdminIntakesPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { archived } = await searchParams;
  const showArchived = archived === "1";

  const intakes = await prisma.intake.findMany({
    where: showArchived ? {} : { archived: false },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pastries: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900">{t.adminIntakes.title}</h1>
      <p className="mt-1 text-amber-700">{t.adminIntakes.subtitle}</p>

      <div className="mt-6 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.adminIntakes.newIntake}</h2>
        <NewIntakeForm t={t.newIntakeForm} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-900">{t.adminIntakes.title}</h2>
        <Link
          href={showArchived ? "/admin" : "/admin?archived=1"}
          className="text-sm text-amber-700 hover:underline"
        >
          {showArchived ? t.adminIntakes.hideArchived : t.adminIntakes.showArchived}
        </Link>
      </div>

      <ul className="mt-3 flex flex-col gap-3">
        {intakes.map((intake) => (
          <li key={intake.id}>
            <Link
              href={`/admin/intakes/${intake.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <FolderIcon />
                <span className="font-medium text-amber-900">
                  {intake.name}
                  {intake.archived && (
                    <span className="ml-2 text-xs font-normal text-amber-500">
                      {t.adminIntakes.archived}
                    </span>
                  )}
                </span>
              </span>
              <span className="text-sm text-amber-600">
                {intake._count.pastries}{" "}
                {intake._count.pastries === 1 ? t.adminIntakes.pastry : t.adminIntakes.pastries} &rarr;
              </span>
            </Link>
          </li>
        ))}
        {intakes.length === 0 && <p className="text-amber-700">{t.adminIntakes.empty}</p>}
      </ul>
    </div>
  );
}
