import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import StudentNav from "@/components/StudentNav";
import RecipeList from "@/components/RecipeList";

export default async function RecipesPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const t = getDictionary(locale);

  const [recipes, categories] = await Promise.all([
    prisma.recipe.findMany({
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.recipeCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <StudentNav locale={locale} t={t.studentNav} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-amber-900">{t.recipes.title}</h1>
        <p className="mt-1 text-amber-700">{t.recipes.subtitle}</p>
        <RecipeList recipes={recipes} categories={categories} t={t.recipes} />
      </main>
    </>
  );
}
