"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, RecipeCategory } from "@/generated/prisma/client";
import Spinner from "@/components/Spinner";
import PdfIcon from "@/components/PdfIcon";
import type { Dictionary } from "@/lib/i18n";

type RecipeWithCategory = Recipe & { category: RecipeCategory | null };

function formatDate(value: Date | string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

export default function RecipeManager({
  recipes,
  categories,
  directUploadEnabled,
  t,
}: {
  recipes: RecipeWithCategory[];
  categories: RecipeCategory[];
  directUploadEnabled: boolean;
  t: Dictionary["adminRecipes"];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Category management
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  async function uploadRecipe(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError(t.pleaseChooseFile);
      return;
    }

    setUploading(true);

    try {
      let res: Response;

      if (directUploadEnabled) {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
        });

        res = await fetch("/api/admin/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, categoryId, pdfUrl: blob.url }),
        });
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("categoryId", categoryId);
        formData.append("file", file);

        res = await fetch("/api/admin/recipes", { method: "POST", body: formData });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `${t.failedUpload} (${res.status} ${res.statusText})`);
        return;
      }

      setName("");
      setCategoryId("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedUpload);
    } finally {
      setUploading(false);
    }
  }

  async function deleteRecipe(id: string) {
    if (!confirm(t.confirmDelete)) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setDeletingId(null);
    }
  }

  async function replaceRecipePdf(id: string, newFile: File) {
    setError("");
    setReplacingId(id);

    try {
      let res: Response;

      if (directUploadEnabled) {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(newFile.name, newFile, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
        });

        res = await fetch(`/api/admin/recipes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfUrl: blob.url }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", newFile);
        res = await fetch(`/api/admin/recipes/${id}`, { method: "PATCH", body: formData });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || t.failedReplacePdf);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedReplacePdf);
    } finally {
      setReplacingId(null);
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError("");
    setAddingCategory(true);

    const res = await fetch("/api/admin/recipe-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });

    setAddingCategory(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCategoryError(data.error || t.failedAddCategory);
      return;
    }

    setNewCategoryName("");
    router.refresh();
  }

  async function deleteCategory(id: string) {
    if (!confirm(t.confirmDeleteCategory)) return;
    setDeletingCategoryId(id);
    const res = await fetch(`/api/admin/recipe-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setDeletingCategoryId(null);
    }
  }

  return (
    <div>
      <div className="mt-6 max-w-lg rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.manageCategories}</h2>
        <form onSubmit={addCategory} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={t.categoryPlaceholder}
            required
            className="flex-1 rounded-md border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingCategory}
            className="flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {addingCategory && <Spinner className="h-4 w-4" />}
            {addingCategory ? t.addingCategory : t.addCategory}
          </button>
        </form>
        {categoryError && <p className="mt-2 text-sm text-red-600">{categoryError}</p>}
        {categories.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800"
              >
                {c.name}
                <button
                  onClick={() => deleteCategory(c.id)}
                  disabled={deletingCategoryId === c.id}
                  className="text-red-600 hover:underline disabled:opacity-60"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 max-w-lg rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.addRecipe}</h2>
        <form onSubmit={uploadRecipe} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-amber-900">{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              required
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900">
              {t.categoryLabel}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="">{t.noCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900">{t.pdfFileLabel}</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="mt-1 block w-full cursor-pointer text-sm text-amber-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-amber-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-amber-800"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="mt-1 flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {uploading && <Spinner className="h-4 w-4" />}
            {uploading ? t.uploading : t.upload}
          </button>
        </form>
      </div>

      <ul className="mt-8 flex flex-col gap-2">
        {recipes.map((recipe) => (
          <li
            key={recipe.id}
            className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <PdfIcon />
              <div className="flex flex-col">
                <a
                  href={recipe.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-900 hover:underline"
                >
                  {recipe.name}
                  {recipe.category && (
                    <span className="ml-2 text-xs font-normal text-amber-500">
                      {recipe.category.name}
                    </span>
                  )}
                </a>
                <span className="text-xs text-amber-500">
                  {t.viewCount.replace("{count}", String(recipe.viewCount))}
                  {recipe.lastAccessedAt
                    ? ` · ${t.lastViewed.replace("{date}", formatDate(recipe.lastAccessedAt) ?? "")}`
                    : ` · ${t.neverViewed}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-amber-700 hover:underline">
                {replacingId === recipe.id && <Spinner className="h-3.5 w-3.5" />}
                {replacingId === recipe.id ? t.replacing : t.replacePdf}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={replacingId === recipe.id}
                  onChange={(e) => {
                    const newFile = e.target.files?.[0];
                    e.target.value = "";
                    if (newFile) replaceRecipePdf(recipe.id, newFile);
                  }}
                />
              </label>
              <button
                onClick={() => deleteRecipe(recipe.id)}
                disabled={deletingId === recipe.id}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-60"
              >
                {deletingId === recipe.id && <Spinner className="h-3.5 w-3.5" />}
                {t.delete}
              </button>
            </div>
          </li>
        ))}
        {recipes.length === 0 && <p className="text-amber-700">{t.empty}</p>}
      </ul>
    </div>
  );
}
