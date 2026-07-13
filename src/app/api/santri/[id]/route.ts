import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import { verifyJWT } from "@/utils/jwt";

const ALLOWED_ROLES = ["admin", "ustadz"];

async function ensureUstadzAccess(cookieStore: Awaited<ReturnType<typeof cookies>>, supabase: ReturnType<typeof createClient>, payload: Awaited<ReturnType<typeof verifyJWT>>, santriId: number) {
  if (!payload || payload.role !== "ustadz") return true;
  const { data: ustadzRows } = await supabase.from("ustadz").select("id").eq("user_id", payload.userId).limit(1);
  const ustadzId = Array.isArray(ustadzRows) && ustadzRows[0] ? (ustadzRows[0] as Record<string, unknown>).id : null;
  if (!ustadzId) return false;

  const { data: santriRows } = await supabase.from("santri").select("halaqah_id").eq("id", santriId).limit(1);
  const targetHalaqahId = Array.isArray(santriRows) && santriRows[0] ? (santriRows[0] as Record<string, unknown>).halaqah_id : null;
  const { data: halaqahRows } = await supabase.from("halaqah").select("id").eq("ustadz_id", ustadzId).eq("id", targetHalaqahId);
  return Boolean(halaqahRows && halaqahRows.length > 0);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const santriId = Number.parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const allowed = await ensureUstadzAccess(cookieStore, supabase, payload, santriId);
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, class: className, halaqah_id, active } = body;

    if (!name || !halaqah_id) {
      return NextResponse.json({ error: "Nama dan Halaqah wajib diisi." }, { status: 400 });
    }

    const { data: existingSantri, error: existingError } = await supabase.from("santri").select("user_id").eq("id", santriId).single();
    if (existingError || !existingSantri) {
      return NextResponse.json({ error: "Santri tidak ditemukan." }, { status: 404 });
    }

    const existing = existingSantri as Record<string, unknown>;
    const { error: userError } = await supabase.from("users").update({ name }).eq("id", existing.user_id);
    if (userError) throw userError;

    const { data: updatedSantri, error: santriError } = await supabase
      .from("santri")
      .update({ class: className, halaqah_id, active: typeof active === "boolean" ? active : true })
      .eq("id", santriId)
      .select("id, user_id, class, active, halaqah_id, halaqah(name), users(name)")
      .single();

    if (santriError || !updatedSantri) {
      throw santriError || new Error("Failed to update santri.");
    }

    const s = updatedSantri as Record<string, unknown>;
    const rawUser = s.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;
    const rawHalaqah = s.halaqah;
    const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

    return NextResponse.json({
      santri: {
        id: s.id as number,
        user_id: s.user_id as number,
        name: userName ?? "-",
        class: (s.class as string) || "-",
        active: typeof s.active === "boolean" ? (s.active as boolean) : true,
        halaqah_id: s.halaqah_id as number,
        halaqah_name: halaqahName ?? "-",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const santriId = Number.parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const allowed = await ensureUstadzAccess(cookieStore, supabase, payload, santriId);
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { data: existingSantri, error: existingError } = await supabase.from("santri").select("user_id").eq("id", santriId).single();
    if (existingError || !existingSantri) {
      return NextResponse.json({ error: "Santri tidak ditemukan." }, { status: 404 });
    }

    const existing = existingSantri as Record<string, unknown>;
    const { error } = await supabase.from("users").delete().eq("id", existing.user_id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Santri deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}