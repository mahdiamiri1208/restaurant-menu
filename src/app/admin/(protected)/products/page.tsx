import { ProductManager } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }], include: { category: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return <section><div className="admin-page-heading"><div><p className="admin-kicker">مدیریت منو</p><h2>محصولات</h2></div></div><ProductManager initial={products} categories={categories} /></section>;
}