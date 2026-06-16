import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tahfiy-super-secret-key-at-least-32-chars-long-2026"
);

export async function signJWT(payload: {
  userId: number;
  username: string;
  role: "admin" | "ustadz" | "student";
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: number;
      username: string;
      role: "admin" | "ustadz" | "student";
      iat: number;
      exp: number;
    };
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}
