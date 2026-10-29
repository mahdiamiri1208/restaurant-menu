import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getPublicMenu = unstable_cache(async () => Promise.all([
  prisma.settings.findUnique({ where: { id: 1 } }),
  prisma.category.findMany({
    where: { isActive: true, products: { some: {} } },
    orderBy: { sortOrder: "asc" },
    include: { products: { orderBy: { sortOrder: "asc" } } },
  }),
]), ["restaurant-public-menu"], { revalidate: 300, tags: ["public-menu"] });