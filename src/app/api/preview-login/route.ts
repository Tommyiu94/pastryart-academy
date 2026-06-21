import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createStudentSession, verifyPreviewToken, STUDENT_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const preview = token ? await verifyPreviewToken(token) : null;

  if (!preview) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const sessionToken = await createStudentSession();
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  return NextResponse.redirect(new URL("/curriculum", origin));
}
