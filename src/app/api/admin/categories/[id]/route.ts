import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators";
import { revalidatePublicMenu } from "@/lib/revalidate-menu";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  await requireAdmin();
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات دسته‌بندی نامعتبر است." }, { status: 400 });
  const category = await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePublicMenu();
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: Context) {
  await requireAdmin();
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  revalidatePublicMenu();
  return NextResponse.json({ ok: true });
}