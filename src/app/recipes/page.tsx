import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import StudentNav from "@/components/StudentNav";

export default async function RecipesPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const t = getDictionary(locale);

  const recipes = await prisma.recipe.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <StudentNav intakeName={session.intakeName} locale={locale} t={t.studentNav} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-amber-900">{t.recipes.title}</h1>
        <p className="mt-1 text-amber-700">{t.recipes.subtitle}</p>

        {recipes.length === 0 ? (
          <p className="mt-8 text-amber-700">{t.recipes.empty}</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <a
                  href={recipe.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
                >
                  <span className="font-medium text-amber-900">
                    {recipe.name}
                    {recipe.category && (
                      <span className="ml-2 text-xs font-normal text-amber-500">
                        {recipe.category}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-amber-600">{t.recipes.viewPdf}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
