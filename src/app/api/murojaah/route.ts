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

    const { data: murojaahData, error } = await supabase
      .from("murojaah")
      .select(
        `id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))`
      )
      .order("id", { ascending: true });

    if (error) throw error;

    const murojaah = (murojaahData || []).map((m: any) => ({
      id: m.id,
      santri_id: m.santri_id,
      date: m.date,
      juz: m.juz,
      start_page: m.start_page,
      end_page: m.end_page,
      name: m.santri?.[0]?.users?.[0]?.name ?? "",
      class: m.santri?.[0]?.class || "",
      halaqah_name: m.santri?.[0]?.halaqah?.[0]?.name || "",
    }));

    return NextResponse.json({ murojaah });
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
          santri_id: parseInt(santri_id, 10),
          date,
          juz: parseInt(juz, 10),
          start_page: parseInt(start_page, 10),
          end_page: parseInt(end_page, 10),
        },
      ])
      .select("id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !newMurojaah) {
      throw error || new Error("Failed to create murojaah.");
    }

    const formatted = {
      id: newMurojaah.id,
      santri_id: newMurojaah.santri_id,
      date: newMurojaah.date,
      juz: newMurojaah.juz,
      start_page: newMurojaah.start_page,
      end_page: newMurojaah.end_page,
      name: newMurojaah.santri?.[0]?.users?.[0]?.name ?? "",
      class: newMurojaah.santri?.[0]?.class || "",
      halaqah_name: newMurojaah.santri?.[0]?.halaqah?.[0]?.name || "",
    };

    return NextResponse.json({ murojaah: formatted }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
