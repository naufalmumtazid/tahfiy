import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import { Ziyadah } from "@/features/ziyadah/types";
import { ziyadahSchema } from "@/features/ziyadah/schemas";

function formatZiyadahResponse(data: unknown): Ziyadah {
  const d = data as Record<string, unknown>;
  
  const targetSantri = Array.isArray(d.santri) ? d.santri[0] : d.santri;

  const rawUser = targetSantri?.users;
  const userName = Array.isArray(rawUser) ? rawUser[0]?.name : rawUser?.name;

  const rawHalaqah = targetSantri?.halaqah;
  const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : rawHalaqah?.name;

  return {
    id: Number(d.id),
    santri_id: Number(d.santri_id),
    date: String(d.date),
    surat: Number(d.surat),
    surat_selesai: d.surat_selesai == null ? null : Number(d.surat_selesai),
    ayat_mulai: Number(d.ayat_mulai),
    ayat_selesai: Number(d.ayat_selesai),
    jumlah_halaman: d.jumlah_halaman == null ? null : Number(d.jumlah_halaman),
    name: userName ?? "-",
    class: String(targetSantri?.class ?? "-"),
    halaqah_name: String(halaqahName ?? "-"),
  };
}

const ALLOWED_ROLES = ["admin", "ustadz", "santri"];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await import("@/utils/jwt").then(({ verifyJWT }) => verifyJWT(token)) : null;
    const userRole = payload?.role as string | undefined;

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const supabase = createClient(cookieStore);

    let query = supabase
      .from("ziyadah")
      .select(
        `id, santri_id, date, surat, surat_selesai, ayat_mulai, ayat_selesai, jumlah_halaman, santri(id, class, halaqah(name), users(name))`
      )
      .order("id", { ascending: true });

    if (userRole === "santri") {
      const { data: santriRows } = await supabase
        .from("santri")
        .select("id")
        .eq("user_id", payload?.userId)
        .limit(1);

      const santriId = Array.isArray(santriRows) && santriRows[0] ? Number((santriRows[0] as Record<string, unknown>).id) : null;
      if (!santriId) {
        return NextResponse.json({ ziyadah: [] });
      }

      query = query.eq("santri_id", santriId);
    }

    const { data: ziyadahData, error } = await query;

    if (error) throw error;

    // 2. Cast data dari Supabase menjadi unknown[] terlebih dahulu
    const rawRows = (ziyadahData as unknown[]) || [];
    const ziyadah = rawRows.map((z) => formatZiyadahResponse(z));

    return NextResponse.json({ ziyadah });
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
    }
    const parsed = ziyadahSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((issue) => issue.message).join(". ") },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: newZiyadah, error } = await supabase
      .from("ziyadah")
      .insert([parsed.data])
      .select("id, santri_id, date, surat, surat_selesai, ayat_mulai, ayat_selesai, jumlah_halaman, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !newZiyadah) {
      throw error || new Error("Failed to create ziyadah.");
    }

    return NextResponse.json({ ziyadah: formatZiyadahResponse(newZiyadah) }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}