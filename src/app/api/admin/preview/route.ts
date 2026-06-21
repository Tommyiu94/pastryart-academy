import { NextResponse } from "next/server";
import { createPreviewToken } from "@/lib/auth";

const ADMIN_HOST = "admin.pastryart-academy.com";
const STUDENT_HOST = "learn.pastryart-academy.com";

export async function GET(request: Request) {
  const token = await createPreviewToken();
  const url = new URL(request.url);
  const targetHost = url.hostname === ADMIN_HOST ? STUDENT_HOST : url.host;
  const target = new URL(`/api/preview-login?token=${token}`, `${url.protocol}//${targetHost}`);

  return NextResponse.redirect(target);
}
