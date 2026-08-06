import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";
import { Ziyadah } from "@/features/ziyadah/types";

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
    ayat_mulai: Number(d.ayat_mulai),
    ayat_selesai: Number(d.ayat_selesai),
    name: userName ?? "-",
    class: String(targetSantri?.class ?? "-"),
    halaqah_name: String(halaqahName ?? "-"),
  };
}

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function GET() {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: ziyadahData, error } = await supabase
      .from("ziyadah")
      .select(
        `id, santri_id, date, surat, ayat_mulai, ayat_selesai, santri(id, class, halaqah(name), users(name))`
      )
      .order("id", { ascending: true });

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

    const body = await request.json();
    const { santri_id, date, surat, ayat_mulai, ayat_selesai } = body;

    if (!santri_id || !date || !surat || !ayat_mulai || !ayat_selesai) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: newZiyadah, error } = await supabase
      .from("ziyadah")
      .insert([{ santri_id, date, surat, ayat_mulai, ayat_selesai }])
      .select("id, santri_id, date, surat, ayat_mulai, ayat_selesai, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !newZiyadah) {
      throw error || new Error("Failed to create ziyadah.");
    }

    return NextResponse.json({ ziyadah: formatZiyadahResponse(newZiyadah) }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}