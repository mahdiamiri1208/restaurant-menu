import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 6;

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= maxAttempts) {
    return NextResponse.json({ error: "تعداد تلاش‌ها بیش از حد مجاز است." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "نام کاربری یا رمز عبور نامعتبر است." }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  const valid = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;
  if (!valid || !admin) {
    attempts.set(key, current && current.resetAt > now ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: now + windowMs });
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(admin.username), sessionCookieOptions());
  return response;
}