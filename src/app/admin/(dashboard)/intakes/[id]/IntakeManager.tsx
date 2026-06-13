"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Intake, Pastry, Lesson } from "@/generated/prisma/client";
import Spinner from "@/components/Spinner";

type IntakeWithPastries = Intake & {
  pastries: (Pastry & { lessons: Lesson[] })[];
};

export default function IntakeManager({ intake }: { intake: IntakeWithPastries }) {
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
      setError(data.error || "Failed to update intake");
      return;
    }

    setPassword("");
    router.refresh();
  }

  async function deleteIntake() {
    if (!confirm(`Delete "${intake.name}" and all its pastries and lessons? This cannot be undone.`)) {
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
      setError(data.error || "Failed to add pastry");
      return;
    }

    setNewPastryName("");
    router.refresh();
  }

  async function deletePastry(pastryId: string, pastryName: string) {
    if (!confirm(`Delete "${pastryName}" and all its lessons?`)) return;
    const res = await fetch(`/api/admin/pastries/${pastryId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mt-2 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-amber-900">{intake.name}</h1>
        <button
          onClick={deleteIntake}
          disabled={deletingIntake}
          className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {deletingIntake && <Spinner className="h-4 w-4" />}
          Delete intake
        </button>
      </div>

      <div className="mt-6 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">Intake settings</h2>
        <form onSubmit={saveDetails} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-amber-900">Intake name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900">
              New password (leave blank to keep current)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={savingDetails}
            className="mt-1 flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {savingDetails && <Spinner className="h-4 w-4" />}
            {savingDetails ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      <div className="mt-8 max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow">
        <h2 className="font-semibold text-amber-900">Add pastry</h2>
        <form onSubmit={addPastry} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newPastryName}
            onChange={(e) => setNewPastryName(e.target.value)}
            placeholder="e.g. Apple Pie"
            required
            className="flex-1 rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingPastry}
            className="flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {addingPastry && <Spinner className="h-4 w-4" />}
            {addingPastry ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <h2 className="mt-10 text-xl font-bold text-amber-900">Pastries &amp; Lessons</h2>
      <div className="mt-4 flex flex-col gap-4">
        {intake.pastries.map((pastry) => (
          <PastryCard key={pastry.id} pastry={pastry} onDeletePastry={deletePastry} />
        ))}
        {intake.pastries.length === 0 && (
          <p className="text-amber-700">No pastries added yet.</p>
        )}
      </div>
    </div>
  );
}

function PastryCard({
  pastry,
  onDeletePastry,
}: {
  pastry: Pastry & { lessons: Lesson[] };
  onDeletePastry: (id: string, name: string) => Promise<void>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingPastry, setDeletingPastry] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  async function uploadLesson(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please choose a PDF file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("pastryId", pastry.id);
    formData.append("title", title);
    formData.append("file", file);

    const res = await fetch("/api/admin/lessons", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to upload lesson");
      return;
    }

    setTitle("");
    setFile(null);
    router.refresh();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson PDF?")) return;
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

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900">{pastry.name}</h3>
        <button
          onClick={handleDeletePastry}
          disabled={deletingPastry}
          className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {deletingPastry && <Spinner className="h-3.5 w-3.5" />}
          Delete pastry
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {pastry.lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex items-center justify-between rounded-md border border-amber-100 px-3 py-2"
          >
            <a
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-800 hover:underline"
            >
              {lesson.title}
            </a>
            <button
              onClick={() => deleteLesson(lesson.id)}
              disabled={deletingLessonId === lesson.id}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-60"
            >
              {deletingLessonId === lesson.id && <Spinner className="h-3.5 w-3.5" />}
              Delete
            </button>
          </li>
        ))}
        {pastry.lessons.length === 0 && (
          <li className="text-sm text-amber-600">No lessons uploaded yet.</li>
        )}
      </ul>

      <form onSubmit={uploadLesson} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-amber-900">Lesson title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pastry Theory Module 1"
            required
            className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-900">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="mt-1 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center justify-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {uploading && <Spinner className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload lesson"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
