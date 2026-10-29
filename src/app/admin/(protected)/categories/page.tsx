import { CategoryManager } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return <section><div className="admin-page-heading"><div><p className="admin-kicker">ساختار منو</p><h2>دسته‌بندی‌ها</h2></div></div><CategoryManager initial={categories} /></section>;
}