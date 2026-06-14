import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePdf, savePdf } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") || "";
  let pdfUrl: string | undefined;
  let title: string | undefined;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (typeof body.title === "string") title = body.title;
    if (typeof body.pdfUrl === "string") pdfUrl = body.pdfUrl;
  } else {
    const formData = await request.formData();
    const titleField = formData.get("title");
    if (typeof titleField === "string" && titleField) title = titleField;

    const file = formData.get("file");
    if (file instanceof File) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
      }
      try {
        pdfUrl = await savePdf(file);
      } catch (err) {
        console.error("Failed to save lesson PDF", err);
        const message = err instanceof Error && err.message ? err.message : String(err);
        return NextResponse.json({ error: `Failed to upload lesson: ${message}` }, { status: 500 });
      }
    }
  }

  if (!pdfUrl && !title) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (pdfUrl) {
    await deletePdf(lesson.pdfUrl);
  }

  const updated = await prisma.lesson.update({
    where: { id },
    data: { ...(pdfUrl ? { pdfUrl } : {}), ...(title ? { title } : {}) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (lesson) {
    await deletePdf(lesson.pdfUrl);
    await prisma.lesson.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
