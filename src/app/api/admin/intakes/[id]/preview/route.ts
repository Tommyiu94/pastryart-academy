import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPreviewToken } from "@/lib/auth";

const ADMIN_HOST = "admin.pastryart-academy.com";
const STUDENT_HOST = "learn.pastryart-academy.com";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const intake = await prisma.intake.findUnique({ where: { id } });
  if (!intake) {
    return NextResponse.json({ error: "Intake not found" }, { status: 404 });
  }

  const token = await createPreviewToken(intake.id, intake.name);
  const url = new URL(request.url);
  const targetHost = url.hostname === ADMIN_HOST ? STUDENT_HOST : url.host;
  const target = new URL(`/api/preview-login?token=${token}`, `${url.protocol}//${targetHost}`);

  return NextResponse.redirect(target);
}
