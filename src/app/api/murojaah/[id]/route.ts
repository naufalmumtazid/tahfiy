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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const murojaahId = parseInt(id, 10);

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
        santri_id: parseInt(santri_id, 10),
        date,
        juz: parseInt(juz, 10),
        start_page: parseInt(start_page, 10),
        end_page: parseInt(end_page, 10),
      })
      .eq("id", murojaahId)
      .select("id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !updated) {
      throw error || new Error("Failed to update murojaah.");
    }

    const formatted = {
      id: updated.id,
      santri_id: updated.santri_id,
      date: updated.date,
      juz: updated.juz,
      start_page: updated.start_page,
      end_page: updated.end_page,
      name: updated.santri?.[0]?.users?.[0]?.name ?? "",
      class: updated.santri?.[0]?.class || "",
      halaqah_name: updated.santri?.[0]?.halaqah?.[0]?.name || "",
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

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
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
