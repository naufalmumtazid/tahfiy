import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function GET() {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("ustadz")
      .select("id, user_id, specialization, phone, active, users(name)")
      .order("id", { ascending: true });

    if (error) throw error;

    const ustadz = ((data || []) as unknown[]).map((row) => {
      const u = row as Record<string, unknown>;
      const rawUser = u.users;
      const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

      return {
        id: u.id as number,
        user_id: u.user_id as number,
        name: userName ?? "-",
        specialization: (u.specialization as string) || "-",
        phone: (u.phone as string) || "-",
        active: typeof u.active === "boolean" ? (u.active as boolean) : true,
      };
    });

    return NextResponse.json({ ustadz });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, specialization, phone, active } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Pilih user ustadz terlebih dahulu." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: existingUser, error: userError } = await supabase.from("users").select("id, name, role").eq("id", user_id).single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: "User ustadz tidak ditemukan." }, { status: 400 });
    }

    const u = existingUser as Record<string, unknown>;
    if (u.role !== "ustadz") {
      return NextResponse.json({ error: "User terpilih bukan berperan ustadz." }, { status: 400 });
    }

    const { data: existingUstadz } = await supabase.from("ustadz").select("id").eq("user_id", user_id).single();
    if (existingUstadz) {
      return NextResponse.json({ error: "User ini sudah terdaftar sebagai ustadz." }, { status: 400 });
    }

    const { data: newUstadz, error: ustadzError } = await supabase
      .from("ustadz")
      .insert([{ user_id, specialization: specialization || null, phone: phone || null, active: typeof active === "boolean" ? active : true }])
      .select("id, user_id, specialization, phone, active")
      .single();

    if (ustadzError || !newUstadz) {
      throw ustadzError || new Error("Failed to create ustadz entry.");
    }

    const nu = newUstadz as Record<string, unknown>;
    return NextResponse.json(
      {
        ustadz: {
          id: nu.id as number,
          user_id: nu.user_id as number,
          name: u.name as string,
          specialization: (nu.specialization as string) || "-",
          phone: (nu.phone as string) || "-",
          active: typeof nu.active === "boolean" ? (nu.active as boolean) : true,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}