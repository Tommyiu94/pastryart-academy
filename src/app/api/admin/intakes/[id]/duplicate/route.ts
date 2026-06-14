import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const intake = await prisma.intake.findUnique({
    where: { id },
    include: { pastries: { include: { lessons: true }, orderBy: { order: "asc" } } },
  });

  if (!intake) {
    return NextResponse.json({ error: "Intake not found" }, { status: 404 });
  }

  const duplicate = await prisma.intake.create({
    data: {
      name: `${intake.name} (Copy)`,
      passwordHash: intake.passwordHash,
      pastries: {
        create: intake.pastries.map((pastry) => ({
          name: pastry.name,
          order: pastry.order,
          lessons: {
            create: pastry.lessons.map((lesson) => ({
              title: lesson.title,
              pdfUrl: lesson.pdfUrl,
              order: lesson.order,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
