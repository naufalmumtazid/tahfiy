import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/database/supabase/server";
import { verifyJWT } from "@/utils/jwt";
import { getErrorMessage } from "@/utils/error";

async function checkIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return false;
    const payload = await verifyJWT(token);
    return payload?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("ustadz")
      .select("id, user_id, specialization, phone, users(name)")
      .order("id", { ascending: true });

    if (error) throw error;

    type UstadzRow = {
      id: number;
      user_id: number;
      specialization?: string;
      phone?: string;
      users?: { name?: string };
    };

    const ustadz = ((data || []) as UstadzRow[]).map((u) => ({
      id: u.id,
      user_id: u.user_id,
      name: u.users?.name || "",
      specialization: u.specialization || "",
      phone: u.phone || "",
    }));

    return NextResponse.json({ ustadz });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, specialization, phone } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "Pilih user ustadz terlebih dahulu." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const userId = parseInt(user_id, 10);
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("id", userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: "User ustadz tidak ditemukan." },
        { status: 400 }
      );
    }

    if (existingUser.role !== "ustadz") {
      return NextResponse.json(
        { error: "User terpilih bukan berperan ustadz." },
        { status: 400 }
      );
    }

    const { data: existingUstadz } = await supabase
      .from("ustadz")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingUstadz) {
      return NextResponse.json(
        { error: "User ini sudah terdaftar sebagai ustadz." },
        { status: 400 }
      );
    }

    const { data: newUstadz, error: ustadzError } = await supabase
      .from("ustadz")
      .insert([
        {
          user_id: userId,
          specialization: specialization || null,
          phone: phone || null,
        },
      ])
      .select("id, user_id, specialization, phone")
      .single();

    if (ustadzError || !newUstadz) {
      throw ustadzError || new Error("Failed to create ustadz entry.");
    }

    return NextResponse.json(
      {
        ustadz: {
          id: newUstadz.id,
          user_id: newUstadz.user_id,
          name: existingUser.name,
          specialization: newUstadz.specialization || "",
          phone: newUstadz.phone || "",
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
