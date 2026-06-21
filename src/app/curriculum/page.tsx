import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import StudentNav from "@/components/StudentNav";
import TrackedPdfLink from "@/components/TrackedPdfLink";

export default async function CurriculumPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const t = getDictionary(locale);

  const pastries = await prisma.pastry.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  return (
    <>
      <StudentNav locale={locale} t={t.studentNav} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-amber-900">{t.curriculum.title}</h1>
        <p className="mt-1 text-amber-700">{t.curriculum.subtitle}</p>

        {pastries.length === 0 ? (
          <p className="mt-8 text-amber-700">{t.curriculum.empty}</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {pastries.map((pastry) => {
              const singleLesson = pastry.lessons.length === 1 ? pastry.lessons[0] : null;
              const cardClassName =
                "block rounded-xl border border-amber-200 bg-white p-5 shadow transition hover:border-amber-400 hover:shadow-md";

              return (
                <li key={pastry.id}>
                  {singleLesson ? (
                    <TrackedPdfLink
                      href={singleLesson.pdfUrl}
                      trackUrl={`/api/lessons/${singleLesson.id}/view`}
                      className={cardClassName}
                    >
                      <h2 className="text-lg font-semibold text-amber-900">{pastry.name}</h2>
                    </TrackedPdfLink>
                  ) : (
                    <Link href={`/curriculum/${pastry.id}`} className={cardClassName}>
                      <h2 className="text-lg font-semibold text-amber-900">{pastry.name}</h2>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
