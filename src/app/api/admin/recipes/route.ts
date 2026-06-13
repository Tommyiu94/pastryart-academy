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

  const pdfUrl = await savePdf(file);

  const recipe = await prisma.recipe.create({
    data: {
      name,
      category: typeof category === "string" && category.trim() ? category.trim() : null,
      pdfUrl,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
