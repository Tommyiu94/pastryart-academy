import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStudentSession, STUDENT_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, settings.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createStudentSession();
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
