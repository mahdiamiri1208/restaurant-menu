import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const localImagePath = z.string().trim().max(255).regex(/^\/uploads\/[a-f0-9-]+\.webp$/i).optional().or(z.literal(""));

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(8).max(128),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optionalText,
  price: z.coerce.number().int().positive().max(1000000000),
  discountPercent: z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.number().int().min(0).max(100).optional()),
  imageUrl: localImagePath,
  isAvailable: z.coerce.boolean().default(true),
  isSpicy: z.coerce.boolean().default(false),
  isVegetarian: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  categoryId: z.string().min(1),
});

export const settingsSchema = z.object({
  restaurantName: z.string().trim().min(2).max(100),
  logoUrl: localImagePath,
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(12).max(128),
});