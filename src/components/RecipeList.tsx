"use client";

import { useMemo, useState } from "react";
import type { Recipe, RecipeCategory } from "@/generated/prisma/client";
import type { Dictionary } from "@/lib/i18n";
import TrackedPdfLink from "@/components/TrackedPdfLink";
import PdfIcon from "@/components/PdfIcon";

type RecipeWithCategory = Recipe & { category: RecipeCategory | null };

export default function RecipeList({
  recipes,
  categories,
  t,
}: {
  recipes: RecipeWithCategory[];
  categories: RecipeCategory[];
  t: Dictionary["recipes"];
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (categoryId && recipe.categoryId !== categoryId) return false;
      if (query && !recipe.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [recipes, search, categoryId]);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
        >
          <option value="">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-amber-700">{recipes.length === 0 ? t.empty : t.noResults}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {filtered.map((recipe) => (
            <li key={recipe.id}>
              <TrackedPdfLink
                href={recipe.pdfUrl}
                trackUrl={`/api/recipes/${recipe.id}/view`}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
              >
                <span className="flex items-center gap-3">
                  <PdfIcon />
                  <span className="font-medium text-amber-900">
                    {recipe.name}
                    {recipe.category && (
                      <span className="ml-2 text-xs font-normal text-amber-500">
                        {recipe.category.name}
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-sm text-amber-600">{t.viewPdf}</span>
              </TrackedPdfLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
