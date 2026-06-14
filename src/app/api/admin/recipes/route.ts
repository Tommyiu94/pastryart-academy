import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { savePdf } from "@/lib/storage";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let name: unknown;
  let categoryId: unknown;
  let pdfUrl: string;

  if (contentType.includes("application/json")) {
    // File was already uploaded directly to Vercel Blob from the browser.
    const body = await request.json();
    name = body.name;
    categoryId = body.categoryId;
    const url = body.pdfUrl;

    if (typeof name !== "string" || typeof url !== "string") {
      return NextResponse.json({ error: "Missing name or pdfUrl" }, { status: 400 });
    }
    pdfUrl = url;
  } else {
    const formData = await request.formData();
    name = formData.get("name");
    categoryId = formData.get("categoryId");
    const file = formData.get("file");

    if (typeof name !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing name or file" }, { status: 400 });
    }

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

  const recipe = await prisma.recipe.create({
    data: {
      name,
      categoryId: typeof categoryId === "string" && categoryId.trim() ? categoryId.trim() : null,
      pdfUrl,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
