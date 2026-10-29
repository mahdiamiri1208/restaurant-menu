import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size === 0 || file.size > maxBytes) {
    return NextResponse.json({ error: "تصویر باید JPEG، PNG یا WebP و حداکثر ۵ مگابایت باشد." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const image = sharp(bytes, { limitInputPixels: 40000000 });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
      return NextResponse.json({ error: "فرمت تصویر معتبر نیست." }, { status: 400 });
    }
    const filename = `${randomUUID()}.webp`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    await image.rotate().resize({ width: 600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(uploadDirectory, filename));
    return NextResponse.json({ imageUrl: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "پردازش تصویر انجام نشد." }, { status: 400 });
  }
}