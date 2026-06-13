import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStudentSession, STUDENT_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { intakeId, password } = await request.json();

  if (!intakeId || !password) {
    return NextResponse.json({ error: "Missing intake or password" }, { status: 400 });
  }

  const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
  if (!intake) {
    return NextResponse.json({ error: "Invalid intake or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, intake.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid intake or password" }, { status: 401 });
  }

  const token = await createStudentSession(intake.id, intake.name);
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  return NextResponse.json({ ok: true });
}
