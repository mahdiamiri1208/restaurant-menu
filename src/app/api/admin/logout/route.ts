import { NextResponse } from "next/server";
import { requireAdmin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  await requireAdmin();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}