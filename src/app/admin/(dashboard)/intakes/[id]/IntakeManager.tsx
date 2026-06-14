"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Intake, Pastry, Lesson } from "@/generated/prisma/client";
import Spinner from "@/components/Spinner";
import PdfIcon from "@/components/PdfIcon";
import type { Dictionary } from "@/lib/i18n";

type IntakeWithPastries = Intake & {
  pastries: (Pastry & { lessons: Lesson[] })[];
};

type T = Dictionary["adminIntakeDetail"];

function formatDate(value: Date | string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

export default function IntakeManager({
  intake,
  directUploadEnabled,
  t,
}: {
  intake: IntakeWithPastries;
  directUploadEnabled: boolean;
  t: T;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  // Rename / password
  const [name, setName] = useState(intake.name);
  const [password, setPassword] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // New pastry
  const [newPastryName, setNewPastryName] = useState("");
  const [addingPastry, setAddingPastry] = useState(false);

  const [deletingIntake, setDeletingIntake] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // Pastry ordering (for drag-and-drop)
  const [pastries, setPastries] = useState(intake.pastries);
  const [draggedPastryIndex, setDraggedPastryIndex] = useState<number | null>(null);

  useEffect(() => {
    setPastries(intake.pastries);
  }, [intake.pastries]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavingDetails(true);

    const body: { name?: string; password?: string } = {};
    if (name !== intake.name) body.name = name;
    if (password) body.password = password;

    if (Object.keys(body).length === 0) {
      setSavingDetails(false);
      return;
    }

    const res = await fetch(`/api/admin/intakes/${intake.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSavingDetails(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.failedUpdate);
      return;
    }

    setPassword("");
    router.refresh();
  }

  async function deleteIntake() {
    if (!confirm(t.confirmDeleteIntake.replace("{name}", intake.name))) {
      return;
    }
    setDeletingIntake(true);
    const res = await fetch(`/api/admin/intakes/${intake.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setDeletingIntake(false);
    }
  }

  async function toggleArchived() {
    setArchiving(true);
    const res = await fetch(`/api/admin/intakes/${intake.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !intake.archived }),
    });
    setArchiving(false);
    if (res.ok) router.refresh();
  }

  async function duplicateIntake() {
    setDuplicating(true);
    setError("");
    const res = await fetch(`/api/admin/intakes/${intake.id}/duplicate`, { method: "POST" });
    setDuplicating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t.failedDuplicate);
      return;
    }

    const created = await res.json();
    router.push(`/admin/intakes/${created.id}`);
  }

  async function addPastry(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAddingPastry(true);

    const res = await fetch("/api/admin/pastries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeId: intake.id, name: newPastryName }),
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
        <h1 className="text-2xl font-bold text-amber-900">
          {intake.name}
          {intake.archived && (
            <span className="ml-2 text-sm font-normal text-amber-500">{t.archivedLabel}</span>
          )}
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <a
            href={`/api/admin/intakes/${intake.id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            {t.previewAsStudent}
          </a>
          <button
            onClick={duplicateIntake}
            disabled={duplicating}
            className="flex items-center gap-2 rounded-md border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            {duplicating && <Spinner className="h-4 w-4" />}
            {duplicating ? t.duplicating : t.duplicateIntake}
          </button>
          <button
            onClick={toggleArchived}
            disabled={archiving}
            className="flex items-center gap-2 rounded-md border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            {archiving && <Spinner className="h-4 w-4" />}
            {intake.archived ? t.unarchiveIntake : t.archiveIntake}
          </button>
          <button
            onClick={deleteIntake}
            disabled={deletingIntake}
            className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {deletingIntake && <Spinner className="h-4 w-4" />}
            {t.deleteIntake}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">{t.settingsTitle}</h2>
        <form onSubmit={saveDetails} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-amber-900">{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
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
            disabled={savingDetails}
            className="mt-1 flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {savingDetails && <Spinner className="h-4 w-4" />}
            {savingDetails ? t.saving : t.save}
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900">{pastry.name}</h3>
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
