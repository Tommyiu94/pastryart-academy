import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePdf } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const pastry = await prisma.pastry.update({ where: { id }, data: { name } });
  return NextResponse.json(pastry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lessons = await prisma.lesson.findMany({ where: { pastryId: id } });
  await Promise.all(lessons.map((lesson) => deletePdf(lesson.pdfUrl)));

  await prisma.pastry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
