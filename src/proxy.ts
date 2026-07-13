import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/utils/jwt";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // console.log(`[Proxy Src] Intercepted Request: ${pathname} | Token Present: ${!!token}`);

  // 1. Tentukan rute-rute yang membutuhkan proteksi berbasis role
  const isAdminRoute = pathname.startsWith("/admin");
  const isUstadzRoute = pathname.startsWith("/ustadz");
  const isSantriRoute = pathname.startsWith("/santri");

  if (isAdminRoute || isUstadzRoute || isSantriRoute) {
    // Jika tidak ada token, langsung lempar ke halaman login
    if (!token) {
      // console.log(`[Proxy Src] Redirecting to /login (no token found)`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token);
    console.log(`[Proxy Src] Token payload:`, payload);

    // Jika token tidak valid, bersihkan atau lempar ke login dengan error
    if (!payload) {
      // console.log(`[Proxy Src] Redirecting to /login (invalid token)`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Validasi kecocokan Role dengan Rute yang diakses
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }
    if (isUstadzRoute && payload.role !== "ustadz") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }
    if (isSantriRoute && payload.role !== "santri") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }
  }

  // 2. Pengalihan otomatis jika user yang sudah login mengakses halaman /login
  if (pathname === "/login") {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload && payload.role) {
        console.log(`[Proxy Src] Authenticated user (${payload.role}) on /login, redirecting to dashboard`);
        
        // Arahkan ke dashboard masing-masing sesuai role-nya
        if (payload.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
        if (payload.role === "ustadz") return NextResponse.redirect(new URL("/ustadz", request.url));
        if (payload.role === "santri") return NextResponse.redirect(new URL("/santri", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/ustadz/:path*", 
    "/santri/:path*", 
    "/login"
  ],
};