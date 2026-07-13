import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import bcrypt from "bcryptjs";

const ALLOWED_ROLES = ["admin"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Jika mencari berdasarkan username (misal untuk kebutuhan Auth), izinkan tanpa guard admin
    if (username) {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, password, role, name")
        .eq("username", username)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user });
    }

    // Guard untuk melihat list semua user
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, role, name")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, role, name } = body;

    if (!username || !password || !role || !name) {
      return NextResponse.json(
        { error: "Username, password, name, and role are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: hashedPassword,
          role,
          name,
        },
      ])
      .select("id, username, role, name")
      .single();

    if (error) throw error;

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}