import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { passwordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "رمز جدید باید دست‌کم ۱۲ نویسه داشته باشد." }, { status: 400 });
  if (!await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash)) {
    return NextResponse.json({ error: "رمز عبور فعلی اشتباه است." }, { status: 401 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}