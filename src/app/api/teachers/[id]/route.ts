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

// PUT /api/teachers/[id] - Update teacher (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama teacher wajib diisi." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: updatedTeacher, error } = await supabase
      .from("ustadz")
      .update({ name })
      .eq("id", teacherId)
      .select("id, name")
      .single();

    if (error) throw error;

    return NextResponse.json({
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id] - Delete teacher (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("ustadz").delete().eq("id", teacherId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
