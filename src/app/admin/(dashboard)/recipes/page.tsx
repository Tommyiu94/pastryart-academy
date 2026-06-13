import { prisma } from "@/lib/prisma";
import { DIRECT_UPLOAD_ENABLED } from "@/lib/storage";
import RecipeManager from "./RecipeManager";

export const dynamic = "force-dynamic";

export default async function AdminRecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900">Recipe Library</h1>
      <p className="mt-1 text-amber-700">
        Upload reference recipes available to any student who has logged in.
      </p>
      <RecipeManager recipes={recipes} directUploadEnabled={DIRECT_UPLOAD_ENABLED} />
    </div>
  );
}
