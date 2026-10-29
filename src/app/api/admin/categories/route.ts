import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators";
import { revalidatePublicMenu } from "@/lib/revalidate-menu";

export async function GET() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  await requireAdmin();
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات دسته‌بندی نامعتبر است." }, { status: 400 });
  const category = await prisma.category.create({ data: parsed.data });
  revalidatePublicMenu();
  return NextResponse.json(category, { status: 201 });
}