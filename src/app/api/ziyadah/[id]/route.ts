import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";

interface SupabaseZiyadahRow {
  id: number;
  santri_id: number;
  date: string;
  surat: number;
  ayat_mulai: number;
  ayat_selesai: number;
  santri?: Array<{
    class?: string;
    halaqah?: Array<{ name?: string }>;
    users?: Array<{ name?: string }>;
  }>;
}

interface FormattedZiyadah {
  id: number;
  santri_id: number;
  date: string;
  surat: number;
  ayat_mulai: number;
  ayat_selesai: number;
  name: string;
  class: string;
  halaqah_name: string;
}

function formatZiyadahResponse(data: SupabaseZiyadahRow): FormattedZiyadah {
  const targetSantri = data.santri?.[0];
  
  return {
    id: data.id,
    santri_id: data.santri_id,
    date: data.date,
    surat: data.surat,
    ayat_mulai: data.ayat_mulai,
    ayat_selesai: data.ayat_selesai,
    name: targetSantri?.users?.[0]?.name ?? "",
    class: targetSantri?.class ?? "",
    halaqah_name: targetSantri?.halaqah?.[0]?.name ?? "",
  };
}

// Definisikan role staf yang memiliki akses
const ALLOWED_ROLES = ["admin", "ustadz"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ziyadahId = parseInt(id, 10);

    // Menggunakan fungsi otentikasi reusable baru
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { santri_id, date, surat, ayat_mulai, ayat_selesai } = body;

    if (!santri_id || !date || !surat || !ayat_mulai || !ayat_selesai) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existing, error: existingError } = await supabase
      .from("ziyadah")
      .select("id")
      .eq("id", ziyadahId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Ziyadah tidak ditemukan." }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from("ziyadah")
      .update({
        santri_id: parseInt(santri_id, 10),
        date,
        surat: parseInt(surat, 10),
        ayat_mulai: parseInt(ayat_mulai, 10),
        ayat_selesai: parseInt(ayat_selesai, 10),
      })
      .eq("id", ziyadahId)
      .select("id, santri_id, date, surat, ayat_mulai, ayat_selesai, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !updated) {
      throw error || new Error("Failed to update ziyadah.");
    }

    // Lakukan type casting yang aman ke interface SupabaseZiyadahRow sebelum diformat
    const rawUpdated = updated as unknown as SupabaseZiyadahRow;
    const formatted = formatZiyadahResponse(rawUpdated);

    return NextResponse.json({ ziyadah: formatted });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ziyadahId = parseInt(id, 10);

    // Menggunakan fungsi otentikasi reusable baru
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existing, error: existingError } = await supabase
      .from("ziyadah")
      .select("id")
      .eq("id", ziyadahId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Ziyadah tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase.from("ziyadah").delete().eq("id", ziyadahId);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Ziyadah deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}