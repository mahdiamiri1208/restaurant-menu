import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validators";
import { revalidatePublicMenu } from "@/lib/revalidate-menu";

export async function GET() {
  await requireAdmin();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  await requireAdmin();
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات رستوران نامعتبر است." }, { status: 400 });
  const settings = await prisma.settings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  revalidatePublicMenu();
  return NextResponse.json(settings);
}