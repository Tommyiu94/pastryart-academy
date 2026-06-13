import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePdf } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (recipe) {
    await deletePdf(recipe.pdfUrl);
    await prisma.recipe.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
