import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const encoder = new TextEncoder();
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET не задан в переменных окружения");
  return encoder.encode(secret);
}

export type AdminRole = "FULL" | "MODERATOR";

export interface SessionPayload {
  sub: string;
  name: string;
  role: AdminRole;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch (e) {
    console.error("[verifySessionToken] ошибка проверки токена:", e);
    return null;
  }
}
