import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validators";
import { revalidatePublicMenu } from "@/lib/revalidate-menu";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  await requireAdmin();
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات محصول نامعتبر است." }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: parsed.data, include: { category: true } });
  revalidatePublicMenu();
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Context) {
  await requireAdmin();
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  revalidatePublicMenu();
  return NextResponse.json({ ok: true });
}