import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/database/supabase/server";
import { verifyJWT } from "@/utils/jwt";

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
      .from("halaqah")
      .select("id, name, ustadz_id, ustadz(user_id, users(name))")
      .order("id", { ascending: true });

    if (error) throw error;

    const halaqahs = (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      ustadz_id: h.ustadz_id,
      ustadz_name: h.ustadz?.users?.name || "N/A",
    }));


    return NextResponse.json({ halaqahs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, ustadz_id } = body;

    if (!name || !ustadz_id) {
      return NextResponse.json(
        { error: "Nama halaqah dan ustadz wajib diisi." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: newHalaqah, error } = await supabase
      .from("halaqah")
      .insert([{ name, ustadz_id: parseInt(ustadz_id, 10) }])
      .select("id, name, ustadz_id, ustadz(user_id, users(name))")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        halaqah: {
          id: newHalaqah.id,
          name: newHalaqah.name,
          ustadz_id: newHalaqah.ustadz_id,
          ustadz_name: newHalaqah.ustadz?.[0]?.users?.[0]?.name || "N/A",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
