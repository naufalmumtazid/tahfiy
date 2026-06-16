"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { signJWT, verifyJWT } from "@/utils/jwt";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "auth_token";

export interface AuthUser {
  userId: number;
  username: string;
  role: "admin" | "ustadz" | "santri";
}

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  // 1. Check for dummy admin credentials
  if (username === "admin" && password === "admin123") {
    const user: AuthUser = {
      userId: 999999, // dummy ID for admin
      username: "admin",
      role: "admin",
    };

    const token = await signJWT(user);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true, redirectTo: "/admin" };
  }

  // 2. Otherwise, check via the Next.js API route
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const apiUrl = `${protocol}://${host}/api/users?username=${encodeURIComponent(username)}`;

    const cookieStore = await cookies();
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      return { error: "Invalid username or password." };
    }

    const data = await response.json();
    const user = data.user;

    if (!user) {
      return { error: "Invalid username or password." };
    }

    // Compare password hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { error: "Invalid username or password." };
    }

    const loggedInUser: AuthUser = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = await signJWT(loggedInUser);
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Determine redirection based on role
    const redirectTo = user.role === "admin" ? "/admin" : "/";
    return { success: true, redirectTo };
  } catch (err) {
    console.error("Authentication error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  } catch (err) {
    return null;
  }
}
