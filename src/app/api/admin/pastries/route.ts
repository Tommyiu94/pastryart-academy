import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const count = await prisma.pastry.count();
  const pastry = await prisma.pastry.create({
    data: { name, order: count },
  });

  return NextResponse.json(pastry, { status: 201 });
}
