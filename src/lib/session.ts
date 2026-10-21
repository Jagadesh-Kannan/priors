import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "priors_session";
// Long-lived so the home-screen app on each phone rarely asks to sign in again.
const SESSION_DAYS = 90;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

export async function getSession(): Promise<{ userId?: string }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return {};
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return { userId: payload.sub };
  } catch {
    return {};
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
