import { jwtVerify } from "jose";

function jwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, jwtKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}