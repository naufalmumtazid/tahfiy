import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const halaqahId = parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
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
      .update({ name, ustadz_id }) // Langsung inject tanpa parseInt tambahan
      .eq("id", halaqahId)
      .select("id, name, ustadz_id, ustadz(user_id, users(name))")
      .single();

    if (error || !updated) throw error || new Error("Failed to update halaqah.");

    const h = updated as Record<string, unknown>;
    const ustadz = Array.isArray(h.ustadz) ? h.ustadz[0] : (h.ustadz as Record<string, unknown> | undefined);
    const rawUser = ustadz?.users;
    const userName = Array.isArray(rawUser) ? rawUser[0]?.name : (rawUser as Record<string, string> | undefined)?.name;

    return NextResponse.json({
      halaqah: {
        id: h.id as number,
        name: h.name as string,
        ustadz_id: h.ustadz_id as number,
        ustadz_name: userName ?? "-",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const halaqahId = parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("halaqah").delete().eq("id", halaqahId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Halaqah deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}