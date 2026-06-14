import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePdf, savePdf } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") || "";
  let pdfUrl: string | undefined;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (typeof body.pdfUrl === "string") pdfUrl = body.pdfUrl;
  } else {
    const formData = await request.formData();
    const file = formData.get("file");
    if (file instanceof File) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
      }
      try {
        pdfUrl = await savePdf(file);
      } catch (err) {
        console.error("Failed to save recipe PDF", err);
        const message = err instanceof Error && err.message ? err.message : String(err);
        return NextResponse.json({ error: `Failed to upload recipe: ${message}` }, { status: 500 });
      }
    }
  }

  if (!pdfUrl) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await deletePdf(recipe.pdfUrl);

  const updated = await prisma.recipe.update({ where: { id }, data: { pdfUrl } });
  return NextResponse.json(updated);
}

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
