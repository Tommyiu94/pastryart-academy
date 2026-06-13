import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { savePdf } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formData.get("name");
  const category = formData.get("category");
  const file = formData.get("file");

  if (typeof name !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing name or file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  let pdfUrl: string;
  try {
    pdfUrl = await savePdf(file);
  } catch (err) {
    console.error("Failed to save recipe PDF", err);
    const message = err instanceof Error && err.message ? err.message : String(err);
    return NextResponse.json({ error: `Failed to upload recipe: ${message}` }, { status: 500 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      name,
      category: typeof category === "string" && category.trim() ? category.trim() : null,
      pdfUrl,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
