import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, passwordHash },
    update: { passwordHash },
  });

  return NextResponse.json({ id: settings.id });
}
