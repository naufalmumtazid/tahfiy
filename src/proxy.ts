import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/jwt";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Proxy Src] Intercepted Request: ${pathname} | Token Present: ${!!token}`);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log(`[Proxy Src] Redirecting to /login (no token found)`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token);
    console.log(`[Proxy Src] Token payload:`, payload);

    if (!payload || payload.role !== "admin") {
      console.log(`[Proxy Src] Redirecting to /login (invalid token or not admin)`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated admin users away from login page
  if (pathname === "/login") {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload && payload.role === "admin") {
        console.log(`[Proxy Src] Authenticated admin on /login, redirecting to /admin`);
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
