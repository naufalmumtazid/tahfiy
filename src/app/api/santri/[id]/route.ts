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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const santriId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, class: className, halaqah_id } = body;

    if (!name || !className || !halaqah_id) {
      return NextResponse.json(
        { error: "Nama, Kelas, dan Halaqah wajib diisi." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingSantri, error: existingError } = await supabase
      .from("santri")
      .select("user_id")
      .eq("id", santriId)
      .single();

    if (existingError || !existingSantri) {
      return NextResponse.json({ error: "Santri tidak ditemukan." }, { status: 404 });
    }

    const { error: userError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", existingSantri.user_id);

    if (userError) throw userError;

    const { data: updatedSantri, error: santriError } = await supabase
      .from("santri")
      .update({
        class: className,
        halaqah_id: parseInt(halaqah_id, 10),
      })
      .eq("id", santriId)
      .select("id, user_id, class, halaqah_id, halaqah(name), users(name)")
      .single();

    if (santriError || !updatedSantri) {
      throw santriError || new Error("Failed to update santri.");
    }

    const formattedSantri = {
      id: updatedSantri.id,
      user_id: updatedSantri.user_id,
      name: updatedSantri.users?.name || "",
      class: updatedSantri.class,
      halaqah_id: updatedSantri.halaqah_id,
      halaqah_name: updatedSantri.halaqah ? updatedSantri.halaqah.name : "N/A",
    };

    return NextResponse.json({ santri: formattedSantri });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const santriId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingSantri, error: existingError } = await supabase
      .from("santri")
      .select("user_id")
      .eq("id", santriId)
      .single();

    if (existingError || !existingSantri) {
      return NextResponse.json({ error: "Santri tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase.from("users").delete().eq("id", existingSantri.user_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Santri deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
