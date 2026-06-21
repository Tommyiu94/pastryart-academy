import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const secretKey = new TextEncoder().encode(SESSION_SECRET);

export const STUDENT_COOKIE = "academy_session";
export const ADMIN_COOKIE = "academy_admin_session";

type StudentSession = {
  type: "student";
};

type AdminSession = {
  type: "admin";
};

type PreviewSession = {
  type: "preview";
};

export async function createStudentSession() {
  return new SignJWT({ type: "student" } satisfies StudentSession)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("180d")
    .sign(secretKey);
}

export async function createAdminSession() {
  return new SignJWT({ type: "admin" } satisfies AdminSession)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function createPreviewToken() {
  return new SignJWT({ type: "preview" } satisfies PreviewSession)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(secretKey);
}

export async function verifyPreviewToken(token: string): Promise<PreviewSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.type !== "preview") return null;
    return payload as unknown as PreviewSession;
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.type !== "student") return null;
    return payload as unknown as StudentSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.type !== "admin") return null;
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}
