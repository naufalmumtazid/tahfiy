import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";

export async function checkIsAuthorized(allowedRoles: string[]): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return false;

    const payload = await verifyJWT(token);
    const userRole = payload?.role;

    return !!userRole && allowedRoles.includes(userRole);
  } catch {
    return false;
  }
}