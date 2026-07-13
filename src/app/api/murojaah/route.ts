import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth"; // <-- Gunakan helper andalan proyekmu

const ALLOWED_ROLES = ["admin", "ustadz"]; // Tentukan role apa saja yang diizinkan

export async function GET() {
  try {
    // Validasi otorisasi menggunakan helper proyek
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: murojaahData, error } = await supabase
      .from("murojaah")
      .select(
        `id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))`
      )
      .order("id", { ascending: true });

    if (error) throw error;

    // Mapping super aman, tanpa memicu error linter any milik ESLint
    const murojaah = ((murojaahData || []) as unknown[]).map((row) => {
      const m = row as Record<string, unknown>;
      const santri = Array.isArray(m.santri) ? m.santri[0] : (m.santri as Record<string, unknown> | undefined);
      
      const rawUser = santri?.users;
      const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

      const rawHalaqah = santri?.halaqah;
      const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

      return {
        id: m.id as number,
        santri_id: m.santri_id as number,
        date: m.date as string,
        juz: m.juz as number,
        start_page: m.start_page as number,
        end_page: m.end_page as number,
        name: userName ?? "-",
        class: (santri?.class as string) || "-",
        halaqah_name: halaqahName ?? "-",
      };
    });

    return NextResponse.json({ murojaah });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Validasi otorisasi menggunakan helper proyek
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { santri_id, date, juz, start_page, end_page } = body;

    if (!santri_id || !date || !juz || !start_page || !end_page) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: newMurojaah, error } = await supabase
      .from("murojaah")
      .insert([
        {
          santri_id,   // Langsung panggil variabel murni (tidak perlu parseInt jika dari frontend sudah memakai z.coerce)
          date,
          juz,
          start_page,
          end_page,
        },
      ])
      .select("id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !newMurojaah) {
      throw error || new Error("Failed to create murojaah.");
    }

    // Ekstrak data tunggal baru hasil insert agar tipenya lolos sensor ESLint
    const m = newMurojaah as Record<string, unknown>;
    const santri = Array.isArray(m.santri) ? m.santri[0] : (m.santri as Record<string, unknown> | undefined);
    
    const rawUser = santri?.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

    const rawHalaqah = santri?.halaqah;
    const halaqahName = Array.isArray(rawHalaqah) ? rawHalaqah[0]?.name : (rawHalaqah as Record<string, string> | undefined)?.name;

    const formatted = {
      id: m.id as number,
      santri_id: m.santri_id as number,
      date: m.date as string,
      juz: m.juz as number,
      start_page: m.start_page as number,
      end_page: m.end_page as number,
      name: userName ?? "-",
      class: (santri?.class as string) || "-",
      halaqah_name: halaqahName ?? "-",
    };

    return NextResponse.json({ murojaah: formatted }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}