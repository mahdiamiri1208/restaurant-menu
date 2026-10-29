import "server-only";

import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session-token";

export const SESSION_COOKIE = "restaurant_admin_session";
const sessionDuration = 60 * 60 * 12;

function jwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function createSession(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(jwtKey());
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const username = token ? await verifySession(token) : null;
  if (!username) redirect("/admin/login");
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) redirect("/admin/login");
  return admin;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: sessionDuration,
  };
}