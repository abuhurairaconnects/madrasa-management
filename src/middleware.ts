import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets, APIs, and login pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/login" ||
    pathname === "/guardian/login" ||
    pathname.startsWith("/guardian")
  ) {
    return NextResponse.next();
  }

  // 2. Strictly block Guardians from accessing the Madrasa main dashboard or internal pages
  const userTypeCookie = request.cookies.get("madrasa_user_type");
  if (userTypeCookie?.value === "GUARDIAN") {
    const guardianUrl = new URL("/guardian", request.url);
    return NextResponse.redirect(guardianUrl);
  }

  // 3. Check for active Madrasa Admin login cookie
  const institutionCookie = request.cookies.get("madrasa_institution_id");

  // If user is not logged in as Madrasa Admin, redirect them to /login
  if (!institutionCookie || !institutionCookie.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)",
  ],
};
