import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const intakes = await prisma.intake.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pastries: true } } },
  });
  return NextResponse.json(intakes);
}

export async function POST(request: Request) {
  const { name, password } = await request.json();

  if (!name || !password) {
    return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const intake = await prisma.intake.create({
    data: { name, passwordHash },
  });

  return NextResponse.json(intake, { status: 201 });
}
