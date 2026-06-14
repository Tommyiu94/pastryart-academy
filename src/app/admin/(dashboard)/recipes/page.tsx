import { prisma } from "@/lib/prisma";
import { DIRECT_UPLOAD_ENABLED } from "@/lib/storage";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import RecipeManager from "./RecipeManager";

export const dynamic = "force-dynamic";

export default async function AdminRecipesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const recipes = await prisma.recipe.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900">{t.adminRecipes.title}</h1>
      <p className="mt-1 text-amber-700">{t.adminRecipes.subtitle}</p>
      <RecipeManager
        recipes={recipes}
        directUploadEnabled={DIRECT_UPLOAD_ENABLED}
        t={t.adminRecipes}
      />
    </div>
  );
}
