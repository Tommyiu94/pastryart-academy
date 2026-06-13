import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, password } = await request.json();

  const data: { name?: string; passwordHash?: string } = {};
  if (name) data.name = name;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const intake = await prisma.intake.update({ where: { id }, data });
  return NextResponse.json(intake);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.intake.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
