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
    const halaqahId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
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

    const { data: updated, error } = await supabase
      .from("halaqah")
      .update({ name, ustadz_id: parseInt(ustadz_id, 10) })
      .eq("id", halaqahId)
      .select("id, name, ustadz_id, ustadz(user_id, users(name))")
      .single();

    if (error || !updated) throw error || new Error("Failed to update halaqah.");

    return NextResponse.json({
      halaqah: {
        id: updated.id,
        name: updated.name,
        ustadz_id: updated.ustadz_id,
        ustadz_name: updated.ustadz?.[0]?.users?.[0]?.name || "N/A",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const halaqahId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("halaqah").delete().eq("id", halaqahId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Halaqah deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
