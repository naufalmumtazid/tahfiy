import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import { verifyJWT } from "@/utils/jwt";
import bcrypt from "bcryptjs";

function generateUsername(name: string, attempt = 0) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return attempt === 0 ? base : `${base}_${attempt}`;
}

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function GET(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // extract query params
    const url = new URL(request.url);
    const halaqahIdParam = url.searchParams.get("halaqah_id");

    // get user info from token to restrict ustadz
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const userRole = payload?.role as string | undefined;

    let query = supabase
      .from("santri")
      .select("id, user_id, class, active, halaqah_id, halaqah(name), users(name)")
      .order("id", { ascending: true });

    // if halaqah_id param provided, filter by it
    if (halaqahIdParam) {
      const hid = Number(halaqahIdParam);
      if (!Number.isNaN(hid)) query = query.eq("halaqah_id", hid);
    }

    // if the caller is ustadz, restrict to deras' halaqah only
    if (userRole === "ustadz") {
      // find ustadz id by user id
      const { data: ustadzRows } = await supabase
        .from("ustadz")
        .select("id")
        .eq("user_id", payload?.userId)
        .limit(1);

      const ustadzId = Array.isArray(ustadzRows) && ustadzRows[0] ? (ustadzRows[0] as Record<string, unknown>).id : null;
      if (!ustadzId) return NextResponse.json({ santri: [] });

      // get halaqah ids for this ustadz
      const { data: halaqahRows } = await supabase.from("halaqah").select("id").eq("ustadz_id", ustadzId);
      const halaqahIds = (halaqahRows || []).map((r: Record<string, unknown>) => r.id as number);
      if (halaqahIds.length === 0) return NextResponse.json({ santri: [] });

      query = query.in("halaqah_id", halaqahIds);
    }

    const { data: santriData, error } = await query;

    if (error) throw error;

    const santri = ((santriData || []) as unknown[]).map((row) => {
      const s = row as Record<string, unknown>;

      const rawUser = s.users;
      const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

      const rawHalaqah = s.halaqah;
      const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

      return {
        id: s.id as number,
        user_id: s.user_id as number,
        name: userName ?? "-",
        class: (s.class as string) || "-",
        active: typeof s.active === "boolean" ? (s.active as boolean) : true,
        halaqah_id: s.halaqah_id as number,
        halaqah_name: halaqahName ?? "-",
      };
    });

    return NextResponse.json({ santri });
  } catch (error: unknown) {
    console.error("LOG ERROR API SANTRI:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "An error occurred" },
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
    const { name, class: className, halaqah_id } = body;

    if (!name || !halaqah_id) {
      return NextResponse.json(
        { error: "Nama dan Halaqah wajib diisi." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let username = generateUsername(name);
    const password = "santri";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser: Record<string, unknown> | null = null;
    let userError: Error | null = null;
    let usernameAttempt = 0;

    while (usernameAttempt < 5) {
      const result = await supabase
        .from("users")
        .insert([
          {
            username,
            password: hashedPassword,
            role: "santri",
            name,
          },
        ])
        .select("id")
        .single();

      newUser = result.data as Record<string, unknown> | null;
      userError = result.error;

      if (!userError) {
        break;
      }

      const message = String(userError.message || "").toLowerCase();
      if (message.includes("duplicate") || message.includes("unique") || message.includes("already exists")) {
        usernameAttempt += 1;
        username = generateUsername(name, usernameAttempt);
        continue;
      }

      break;
    }

    if (userError || !newUser) {
      throw userError || new Error("Failed to create user for santri.");
    }

    // 2. Insert data profil ke tabel santri
    const { data: newSantri, error: santriError } = await supabase
      .from("santri")
      .insert([
        {
          user_id: newUser.id,
          class: className,
          halaqah_id, // Langsung disuntikkan tanpa parseInt tambahan
        },
      ])
      .select("id, user_id, class, halaqah_id, halaqah(name), users(name)")
      .single();

    // Rollback akun user jika input data profil santrinya gagal dilakukan
    if (santriError || !newSantri) {
      await supabase.from("users").delete().eq("id", newUser.id);
      throw santriError || new Error("Failed to create santri entry.");
    }

    const s = newSantri as Record<string, unknown>;
    const rawUser = s.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

    const rawHalaqah = s.halaqah;
    const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

    const formattedSantri = {
      id: s.id as number,
      user_id: s.user_id as number,
      name: userName ?? "-",
      class: (s.class as string) || "-",
      halaqah_id: s.halaqah_id as number,
      halaqah_name: halaqahName ?? "-",
    };

    return NextResponse.json({ santri: formattedSantri }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}