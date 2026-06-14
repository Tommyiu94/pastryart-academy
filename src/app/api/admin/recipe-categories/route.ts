import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.recipeCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { name } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const category = await prisma.recipeCategory.create({ data: { name: name.trim() } });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
  }
}
