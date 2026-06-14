"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/generated/prisma/client";
import Spinner from "@/components/Spinner";
import type { Dictionary } from "@/lib/i18n";

export default function RecipeManager({
  recipes,
  directUploadEnabled,
  t,
}: {
  recipes: Recipe[];
  directUploadEnabled: boolean;
  t: Dictionary["adminRecipes"];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          body: JSON.stringify({ name, category, pdfUrl: blob.url }),
        });
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("file", file);

        res = await fetch("/api/admin/recipes", { method: "POST", body: formData });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `${t.failedUpload} (${res.status} ${res.statusText})`);
        return;
      }

      setName("");
      setCategory("");
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

  return (
    <div>
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
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t.categoryPlaceholder}
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900">{t.pdfFileLabel}</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="mt-1 text-sm"
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
            className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow"
          >
            <a
              href={recipe.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-900 hover:underline"
            >
              {recipe.name}
              {recipe.category && (
                <span className="ml-2 text-xs font-normal text-amber-500">
                  {recipe.category}
                </span>
              )}
            </a>
            <button
              onClick={() => deleteRecipe(recipe.id)}
              disabled={deletingId === recipe.id}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-60"
            >
              {deletingId === recipe.id && <Spinner className="h-3.5 w-3.5" />}
              {t.delete}
            </button>
          </li>
        ))}
        {recipes.length === 0 && <p className="text-amber-700">{t.empty}</p>}
      </ul>
    </div>
  );
}
