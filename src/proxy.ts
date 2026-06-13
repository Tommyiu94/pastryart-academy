import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { STUDENT_COOKIE, ADMIN_COOKIE } from "@/lib/auth";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const secretKey = new TextEncoder().encode(SESSION_SECRET);

const ADMIN_HOST = "admin.pastryart-academy.com";
const STUDENT_HOST = "learn.pastryart-academy.com";

async function hasValidSession(request: NextRequest, cookieName: string, type: string) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload.type === type;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0];
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Keep the admin panel and the student portal on separate subdomains.
  if (hostname === ADMIN_HOST) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!isAdminPath) {
      return new NextResponse("Not Found", { status: 404 });
    }
  } else if (hostname === STUDENT_HOST) {
    if (isAdminPath) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") return NextResponse.next();
    if (!(await hasValidSession(request, ADMIN_COOKIE, "admin"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!(await hasValidSession(request, ADMIN_COOKIE, "admin"))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/curriculum") || pathname.startsWith("/recipes")) {
    if (!(await hasValidSession(request, STUDENT_COOKIE, "student"))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/curriculum/:path*", "/recipes/:path*"],
};
