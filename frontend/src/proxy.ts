import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS: string[] = [
  "/login",
  "/auth/callback",
  "/play",
  "/join",
];

const ADMIN_PREFIX = "/admin";

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token: string | undefined = request.cookies.get("auth_token")?.value;
  const isAuthenticated: boolean = !!token;

  if (pathname === "/") {
    const target = isAuthenticated ? "/home" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    try {
      const rolesRaw: string | undefined =
        request.cookies.get("user_roles")?.value;
      const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];
      const isAdmin: boolean = roles.includes("admin") || roles.includes("superadmin");

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/|media/).*)",],
};
