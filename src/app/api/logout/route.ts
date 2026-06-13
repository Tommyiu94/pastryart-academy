import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STUDENT_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE);
  return NextResponse.json({ ok: true });
}
