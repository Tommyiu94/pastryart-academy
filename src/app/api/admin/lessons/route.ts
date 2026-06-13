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

  const pdfUrl = await savePdf(file);

  const count = await prisma.lesson.count({ where: { pastryId } });
  const lesson = await prisma.lesson.create({
    data: { pastryId, title, pdfUrl, order: count },
  });

  return NextResponse.json(lesson, { status: 201 });
}
