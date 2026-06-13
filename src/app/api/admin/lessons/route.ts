import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { savePdf } from "@/lib/storage";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let pastryId: unknown;
  let title: unknown;
  let pdfUrl: string;

  if (contentType.includes("application/json")) {
    // File was already uploaded directly to Vercel Blob from the browser.
    const body = await request.json();
    pastryId = body.pastryId;
    title = body.title;
    const url = body.pdfUrl;

    if (typeof pastryId !== "string" || typeof title !== "string" || typeof url !== "string") {
      return NextResponse.json({ error: "Missing pastryId, title or pdfUrl" }, { status: 400 });
    }
    pdfUrl = url;
  } else {
    const formData = await request.formData();
    pastryId = formData.get("pastryId");
    title = formData.get("title");
    const file = formData.get("file");

    if (typeof pastryId !== "string" || typeof title !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing pastryId, title or file" }, { status: 400 });
    }

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

  const count = await prisma.lesson.count({ where: { pastryId } });
  const lesson = await prisma.lesson.create({
    data: { pastryId, title, pdfUrl, order: count },
  });

  return NextResponse.json(lesson, { status: 201 });
}
