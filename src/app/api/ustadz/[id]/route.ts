import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { checkIsAuthorized } from "@/utils/auth";

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ustadzId = Number.parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, specialization, phone, active } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama ustadz wajib diisi." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: existingUstadz, error: existingError } = await supabase.from("ustadz").select("user_id").eq("id", ustadzId).single();

    if (existingError || !existingUstadz) {
      return NextResponse.json({ error: "Ustadz tidak ditemukan." }, { status: 404 });
    }

    const eu = existingUstadz as Record<string, unknown>;
    const { error: userError } = await supabase.from("users").update({ name }).eq("id", eu.user_id);
    if (userError) throw userError;

    const { data: updatedUstadz, error: ustadzError } = await supabase
      .from("ustadz")
      .update({ specialization: specialization || null, phone: phone || null, active: typeof active === "boolean" ? active : true })
      .eq("id", ustadzId)
      .select("id, user_id, specialization, phone, active")
      .single();

    if (ustadzError || !updatedUstadz) {
      throw ustadzError || new Error("Failed to update ustadz.");
    }

    const uu = updatedUstadz as Record<string, unknown>;
    return NextResponse.json({
      ustadz: {
        id: uu.id as number,
        user_id: uu.user_id as number,
        name,
        specialization: (uu.specialization as string) || "-",
        phone: (uu.phone as string) || "-",
        active: typeof uu.active === "boolean" ? (uu.active as boolean) : true,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ustadzId = Number.parseInt(id, 10);

    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: existingUstadz, error: existingError } = await supabase.from("ustadz").select("user_id").eq("id", ustadzId).single();

    if (existingError || !existingUstadz) {
      return NextResponse.json({ error: "Ustadz tidak ditemukan." }, { status: 404 });
    }

    const eu = existingUstadz as Record<string, unknown>;
    const { error } = await supabase.from("users").delete().eq("id", eu.user_id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Ustadz deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}