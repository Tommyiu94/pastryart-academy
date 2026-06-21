"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Pastry, Lesson } from "@/generated/prisma/client";
import Spinner from "@/components/Spinner";
import PdfIcon from "@/components/PdfIcon";
import type { Dictionary } from "@/lib/i18n";

type T = Dictionary["adminLessons"];

function formatDate(value: Date | string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

export default function PastryManager({
  pastries: initialPastries,
  directUploadEnabled,
  t,
}: {
  pastries: (Pastry & { lessons: Lesson[] })[];
  directUploadEnabled: boolean;
  t: T;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  // Shared student password
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // New pastry
  const [newPastryName, setNewPastryName] = useState("");
  const [addingPastry, setAddingPastry] = useState(false);

  // Pastry ordering (for drag-and-drop)
  const [pastries, setPastries] = useState(initialPastries);
  const [draggedPastryIndex, setDraggedPastryIndex] = useState<number | null>(null);

  useEffect(() => {
    setPastries(initialPastries);
  }, [initialPastries]);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) {
      setSavingPassword(false);
      return;
    }

    setSavingPassword(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setSavingPassword(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.failedUpdatePassword);
      return;
    }

    setPassword("");
    router.refresh();
  }

  async function addPastry(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAddingPastry(true);

    const res = await fetch("/api/admin/pastries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPastryName }),
    });

    setAddingPastry(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.failedAddPastry);
      return;
    }

    setNewPastryName("");
    router.refresh();
  }

  async function deletePastry(pastryId: string, pastryName: string) {
    if (!confirm(t.confirmDeletePastry.replace("{name}", pastryName))) return;
    const res = await fetch(`/api/admin/pastries/${pastryId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  function handlePastryDragStart(index: number) {
    setDraggedPastryIndex(index);
  }

  function handlePastryDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedPastryIndex === null || draggedPastryIndex === index) return;

    setPastries((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedPastryIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedPastryIndex(index);
  }

  async function handlePastryDragEnd() {
    setDraggedPastryIndex(null);
    const res = await fetch("/api/admin/pastries/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: pastries.map((p) => p.id) }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-amber-900">{t.title}</h1>
        <a
          href="/api/admin/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
        >
          {t.previewAsStudent}
        </a>
      </div>
      <p className="mt-1 text-amber-700">{t.subtitle}</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.passwordSectionTitle}</h2>
        <p className="mt-1 text-xs text-amber-600">{t.passwordSectionSubtitle}</p>
        <form onSubmit={savePassword} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-amber-900">
              {t.newPasswordLabel}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="mt-1 flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {savingPassword && <Spinner className="h-4 w-4" />}
            {savingPassword ? t.saving : t.save}
          </button>
        </form>
      </div>

      <div className="mt-8 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.addTheoryLesson}</h2>
        <form onSubmit={addPastry} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newPastryName}
            onChange={(e) => setNewPastryName(e.target.value)}
            placeholder={t.pastryNamePlaceholder}
            required
            className="flex-1 rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingPastry}
            className="flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {addingPastry && <Spinner className="h-4 w-4" />}
            {addingPastry ? t.adding : t.add}
          </button>
        </form>
      </div>

      <h2 className="mt-10 text-xl font-bold text-amber-900">{t.pastriesAndLessons}</h2>
      {pastries.length > 1 && <p className="mt-1 text-xs text-amber-600">{t.dragToReorder}</p>}
      <div className="mt-4 flex flex-col gap-4">
        {pastries.map((pastry, index) => (
          <div
            key={pastry.id}
            draggable
            onDragStart={() => handlePastryDragStart(index)}
            onDragOver={(e) => handlePastryDragOver(e, index)}
            onDragEnd={handlePastryDragEnd}
            className={draggedPastryIndex === index ? "opacity-50" : undefined}
          >
            <PastryCard
              pastry={pastry}
              onDeletePastry={deletePastry}
              directUploadEnabled={directUploadEnabled}
              t={t}
            />
          </div>
        ))}
        {pastries.length === 0 && <p className="text-amber-700">{t.noPastries}</p>}
      </div>
    </div>
  );
}

function PastryCard({
  pastry,
  onDeletePastry,
  directUploadEnabled,
  t,
}: {
  pastry: Pastry & { lessons: Lesson[] };
  onDeletePastry: (id: string, name: string) => Promise<void>;
  directUploadEnabled: boolean;
  t: T;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingPastry, setDeletingPastry] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [replacingLessonId, setReplacingLessonId] = useState<string | null>(null);

  const [lessons, setLessons] = useState(pastry.lessons);
  const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [pastryName, setPastryName] = useState(pastry.name);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setLessons(pastry.lessons);
  }, [pastry.lessons]);

  async function uploadOne(file: File, lessonTitle: string) {
    if (directUploadEnabled) {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
      });

      return fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastryId: pastry.id, title: lessonTitle, pdfUrl: blob.url }),
      });
    }

    const formData = new FormData();
    formData.append("pastryId", pastry.id);
    formData.append("title", lessonTitle);
    formData.append("file", file);

    return fetch("/api/admin/lessons", { method: "POST", body: formData });
  }

  function fileTitle(file: File) {
    return file.name.replace(/\.pdf$/i, "");
  }

  async function uploadLesson(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (files.length === 0) {
      setError(t.pleaseChooseFile);
      return;
    }

    setUploading(true);

    try {
      const isBulk = files.length > 1;

      for (const file of files) {
        const lessonTitle = isBulk ? fileTitle(file) : title;
        const res = await uploadOne(file, lessonTitle);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(
            data?.error || `${t.failedUploadLesson} (${res.status} ${res.statusText})`
          );
          return;
        }
      }

      setTitle("");
      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedUploadLesson);
    } finally {
      setUploading(false);
    }
  }

  async function replaceLessonPdf(lessonId: string, file: File) {
    setError("");
    setReplacingLessonId(lessonId);

    try {
      let res: Response;

      if (directUploadEnabled) {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
        });

        res = await fetch(`/api/admin/lessons/${lessonId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfUrl: blob.url }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "PATCH", body: formData });
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
      setReplacingLessonId(null);
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm(t.confirmDeleteLesson)) return;
    setDeletingLessonId(lessonId);
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setDeletingLessonId(null);
    }
  }

  async function handleDeletePastry() {
    setDeletingPastry(true);
    await onDeletePastry(pastry.id, pastry.name);
    setDeletingPastry(false);
  }

  async function saveRename() {
    setError("");
    const trimmed = pastryName.trim();
    if (!trimmed || trimmed === pastry.name) {
      setPastryName(pastry.name);
      setEditingName(false);
      return;
    }

    setSavingName(true);
    const res = await fetch(`/api/admin/pastries/${pastry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setSavingName(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.failedRenamePastry);
      return;
    }

    setEditingName(false);
    router.refresh();
  }

  function cancelRename() {
    setPastryName(pastry.name);
    setEditingName(false);
  }

  function handleLessonDragStart(index: number) {
    setDraggedLessonIndex(index);
  }

  function handleLessonDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedLessonIndex === null || draggedLessonIndex === index) return;

    setLessons((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedLessonIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedLessonIndex(index);
  }

  async function handleLessonDragEnd() {
    setDraggedLessonIndex(null);
    const res = await fetch("/api/admin/lessons/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: lessons.map((l) => l.id) }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div id={`pastry-${pastry.id}`} className="rounded-xl border border-amber-200 bg-white p-5 shadow">
      <div className="flex items-center justify-between gap-2">
        {editingName ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={pastryName}
              onChange={(e) => setPastryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") cancelRename();
              }}
              autoFocus
              disabled={savingName}
              className="flex-1 rounded-md border border-amber-300 px-2 py-1 text-lg font-semibold text-amber-900 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={saveRename}
              disabled={savingName}
              className="flex items-center gap-1.5 rounded-md bg-amber-700 px-3 py-1 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {savingName && <Spinner className="h-3.5 w-3.5" />}
              {savingName ? t.saving : t.save}
            </button>
            <button
              onClick={cancelRename}
              disabled={savingName}
              className="rounded-md border border-amber-300 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <h3
            onClick={() => setEditingName(true)}
            title={t.renamePastry}
            className="group flex cursor-pointer items-center gap-2 text-lg font-semibold text-amber-900"
          >
            {pastry.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-amber-400 opacity-0 transition group-hover:opacity-100"
            >
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a1 1 0 0 1-.39.243l-3.5 1.25a.5.5 0 0 1-.638-.638l1.25-3.5a1 1 0 0 1 .244-.39l8.5-8.5Z" />
            </svg>
          </h3>
        )}
        <button
          onClick={handleDeletePastry}
          disabled={deletingPastry}
          className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {deletingPastry && <Spinner className="h-3.5 w-3.5" />}
          {t.deletePastry}
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {lessons.map((lesson, index) => (
          <li
            key={lesson.id}
            draggable
            onDragStart={() => handleLessonDragStart(index)}
            onDragOver={(e) => handleLessonDragOver(e, index)}
            onDragEnd={handleLessonDragEnd}
            className={`flex flex-col gap-1 rounded-md border border-amber-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${
              draggedLessonIndex === index ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <PdfIcon className="h-7 w-7" />
              <div className="flex flex-col">
                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-amber-800 hover:underline"
                >
                  {lesson.title}
                </a>
                <span className="text-xs text-amber-500">
                  {t.viewCount.replace("{count}", String(lesson.viewCount))}
                  {lesson.lastAccessedAt
                    ? ` · ${t.lastViewed.replace("{date}", formatDate(lesson.lastAccessedAt) ?? "")}`
                    : ` · ${t.neverViewed}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-amber-700 hover:underline">
                {replacingLessonId === lesson.id && <Spinner className="h-3.5 w-3.5" />}
                {replacingLessonId === lesson.id ? t.replacing : t.replacePdf}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={replacingLessonId === lesson.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) replaceLessonPdf(lesson.id, file);
                  }}
                />
              </label>
              <button
                onClick={() => deleteLesson(lesson.id)}
                disabled={deletingLessonId === lesson.id}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-60"
              >
                {deletingLessonId === lesson.id && <Spinner className="h-3.5 w-3.5" />}
                {t.delete}
              </button>
            </div>
          </li>
        ))}
        {lessons.length === 0 && (
          <li className="text-sm text-amber-600">{t.noLessons}</li>
        )}
      </ul>

      <form onSubmit={uploadLesson} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-amber-900">{t.lessonTitleLabel}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.lessonTitlePlaceholder}
            required={files.length <= 1}
            disabled={files.length > 1}
            className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none disabled:bg-amber-50 disabled:text-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-900">{t.pdfFileLabel}</label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            required
            className="mt-1 block w-full cursor-pointer text-sm text-amber-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-amber-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-amber-800"
          />
          {files.length > 1 && (
            <p className="mt-1 text-xs text-amber-600">
              {t.bulkUploadHint.replace("{count}", String(files.length))}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {uploading && <Spinner className="h-4 w-4" />}
          {uploading ? t.uploading : t.uploadLesson}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
