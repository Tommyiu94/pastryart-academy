import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePdf } from "@/lib/storage";

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
