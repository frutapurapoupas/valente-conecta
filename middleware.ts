import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "vc_admin_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/login-admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const hasAdminCookie = request.cookies.get(ADMIN_COOKIE)?.value === "ok";

  if (!hasAdminCookie) {
    const loginUrl = new URL("/login-admin", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search || ""}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && hasAdminCookie) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};