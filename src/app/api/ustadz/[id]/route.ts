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
    const ustadzId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, specialization, phone } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama ustadz wajib diisi." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingUstadz, error: existingError } = await supabase
      .from("ustadz")
      .select("user_id")
      .eq("id", ustadzId)
      .single();

    if (existingError || !existingUstadz) {
      return NextResponse.json({ error: "Ustadz tidak ditemukan." }, { status: 404 });
    }

    const { error: userError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", existingUstadz.user_id);

    if (userError) throw userError;

    const { data: updatedUstadz, error: ustadzError } = await supabase
      .from("ustadz")
      .update({
        specialization: specialization || null,
        phone: phone || null,
      })
      .eq("id", ustadzId)
      .select("id, user_id, specialization, phone")
      .single();

    if (ustadzError || !updatedUstadz) {
      throw ustadzError || new Error("Failed to update ustadz.");
    }

    return NextResponse.json({
      ustadz: {
        id: updatedUstadz.id,
        user_id: updatedUstadz.user_id,
        name,
        specialization: updatedUstadz.specialization || "",
        phone: updatedUstadz.phone || "",
      },
    });
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
    const ustadzId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: existingUstadz, error: existingError } = await supabase
      .from("ustadz")
      .select("user_id")
      .eq("id", ustadzId)
      .single();

    if (existingError || !existingUstadz) {
      return NextResponse.json({ error: "Ustadz tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase.from("users").delete().eq("id", existingUstadz.user_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Ustadz deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
