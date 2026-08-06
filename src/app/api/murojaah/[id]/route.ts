import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth"; // <-- Gunakan helper andalan proyekmu

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const murojaahId = parseInt(id, 10);

    // Validasi otorisasi
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
      .from("murojaah")
      .select("id")
      .eq("id", murojaahId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Murojaah tidak ditemukan." }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from("murojaah")
      .update({
        santri_id, // Ganti ke direct value karena dari RHF + Zod sudah berupa number asli
        date,
        surat,
        ayat_mulai,
        ayat_selesai,
      })
      .eq("id", murojaahId)
      .select("id, santri_id, date, surat, ayat_mulai, ayat_selesai, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !updated) {
      throw error || new Error("Failed to update murojaah.");
    }

    // Ekstrak data bertingkat menggunakan teknik Record<string, unknown> yang lolos sensor ESLint
    const m = updated as Record<string, unknown>;
    const santri = Array.isArray(m.santri) ? m.santri[0] : (m.santri as Record<string, unknown> | undefined);
    
    const rawUser = santri?.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

    const rawHalaqah = santri?.halaqah;
    const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

    const formatted = {
      id: m.id as number,
      santri_id: m.santri_id as number,
      date: m.date as string,
      surat: m.surat as number,
      ayat_mulai: m.ayat_mulai as number,
      ayat_selesai: m.ayat_selesai as number,
      name: userName ?? "-",
      class: (santri?.class as string) || "-",
      halaqah_name: halaqahName ?? "-",
    };

    return NextResponse.json({ murojaah: formatted });
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
    const murojaahId = parseInt(id, 10);

    // Validasi otorisasi
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existing, error: existingError } = await supabase
      .from("murojaah")
      .select("id")
      .eq("id", murojaahId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Murojaah tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase.from("murojaah").delete().eq("id", murojaahId);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Murojaah deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}