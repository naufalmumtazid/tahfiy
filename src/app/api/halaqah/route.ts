import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import { verifyJWT } from "@/utils/jwt";

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function GET() {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const userRole = payload?.role as string | undefined;

    let query = supabase.from("halaqah").select("id, name, ustadz_id, ustadz(user_id, users(name))").order("id", { ascending: true });

    if (userRole === "ustadz") {
      const { data: ustadzRows } = await supabase.from("ustadz").select("id").eq("user_id", payload?.userId).limit(1);
      const ustadzId = Array.isArray(ustadzRows) && ustadzRows[0] ? (ustadzRows[0] as Record<string, unknown>).id : null;
      if (!ustadzId) return NextResponse.json({ halaqahs: [] });
      query = query.eq("ustadz_id", ustadzId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const halaqahs = ((data || []) as unknown[]).map((row) => {
      const h = row as Record<string, unknown>;
      const ustadz = Array.isArray(h.ustadz) ? h.ustadz[0] : (h.ustadz as Record<string, unknown> | undefined);
      const rawUser = ustadz?.users;
      const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

      return {
        id: h.id as number,
        name: h.name as string,
        ustadz_id: h.ustadz_id as number,
        ustadz_name: userName ?? "-",
      };
    });

    return NextResponse.json({ halaqahs });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
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
      .insert([{ name, ustadz_id }]) // Langsung pakai ustadz_id (asumsi bertipe number dari React Hook Form)
      .select("id, name, ustadz_id, ustadz(user_id, users(name))")
      .single();

    if (error || !newHalaqah) throw error || new Error("Failed to create halaqah.");

    const h = newHalaqah as Record<string, unknown>;
    const ustadz = Array.isArray(h.ustadz) ? h.ustadz[0] : (h.ustadz as Record<string, unknown> | undefined);
    const rawUser = ustadz?.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

    return NextResponse.json(
      {
        halaqah: {
          id: h.id as number,
          name: h.name as string,
          ustadz_id: h.ustadz_id as number,
          ustadz_name: userName ?? "-",
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}