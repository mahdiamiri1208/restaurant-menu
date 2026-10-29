import { NextRequest, NextResponse } from "next/server";

const sessionCookie = "restaurant_admin_session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") return NextResponse.next();

  const token = request.cookies.get(sessionCookie)?.value;
  if (token) return NextResponse.next();

  if (path.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", path);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};