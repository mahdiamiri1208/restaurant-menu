import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12) {
    throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD with at least 12 characters before seeding");
  }

  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash: await bcrypt.hash(password, 12) },
  });

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, restaurantName: "رستوران نارنج", phone: "021-00000000", address: "تهران" },
  });

  const sample = [
    { name: "پیش‌غذا", products: [{ name: "سالاد سزار", description: "کاهوی تازه، مرغ گریل و سس مخصوص", price: 285000, isVegetarian: false }, { name: "سوپ روز", description: "سوپ گرم با سبزیجات فصل", price: 165000, isVegetarian: true }] },
    { name: "غذای اصلی", products: [{ name: "چلو کباب لقمه", description: "کباب دست‌ساز، برنج ایرانی و گوجه کبابی", price: 495000, isSpicy: true }, { name: "پاستا آلفردو", description: "مرغ گریل، قارچ و سس خامه‌ای", price: 385000, discountPercent: 15 }] },
    { name: "نوشیدنی", products: [{ name: "لیموناد نعنا", description: "آب‌لیموی تازه، نعنا و یخ", price: 115000, isVegetarian: true }] },
  ];

  if (!settings.samplesSeeded) for (const [index, category] of sample.entries()) {
    const categoryId = `sample-category-${index + 1}`;
    const savedCategory = await prisma.category.findUnique({ where: { id: categoryId } }) ?? await prisma.category.create({
      data: { id: categoryId, name: category.name, sortOrder: index },
    });
    for (const [productIndex, product] of category.products.entries()) {
      const productId = `sample-product-${index + 1}-${productIndex + 1}`;
      const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
      if (!existingProduct) {
        await prisma.product.create({
          data: { ...product, id: productId, categoryId: savedCategory.id, sortOrder: productIndex },
        });
      }
    }
  }
  if (!settings.samplesSeeded) await prisma.settings.update({ where: { id: 1 }, data: { samplesSeeded: true } });
}

main().finally(async () => prisma.$disconnect());