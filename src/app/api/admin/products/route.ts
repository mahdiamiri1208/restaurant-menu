import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validators";
import { revalidatePublicMenu } from "@/lib/revalidate-menu";

export async function GET() {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }], include: { category: true } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await requireAdmin();
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات محصول نامعتبر است." }, { status: 400 });
  const product = await prisma.product.create({ data: parsed.data, include: { category: true } });
  revalidatePublicMenu();
  return NextResponse.json(product, { status: 201 });
}