import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { intakeId, name } = await request.json();

  if (!intakeId || !name) {
    return NextResponse.json({ error: "Intake and name are required" }, { status: 400 });
  }

  const count = await prisma.pastry.count({ where: { intakeId } });
  const pastry = await prisma.pastry.create({
    data: { intakeId, name, order: count },
  });

  return NextResponse.json(pastry, { status: 201 });
}
