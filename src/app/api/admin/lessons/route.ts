import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { savePdf } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const pastryId = formData.get("pastryId");
  const title = formData.get("title");
  const file = formData.get("file");

  if (typeof pastryId !== "string" || typeof title !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing pastryId, title or file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  let pdfUrl: string;
  try {
    pdfUrl = await savePdf(file);
  } catch (err) {
    console.error("Failed to save lesson PDF", err);
    const message = err instanceof Error ? err.message : "Failed to upload lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const count = await prisma.lesson.count({ where: { pastryId } });
  const lesson = await prisma.lesson.create({
    data: { pastryId, title, pdfUrl, order: count },
  });

  return NextResponse.json(lesson, { status: 201 });
}
