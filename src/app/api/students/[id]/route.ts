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

// PUT /api/students/[id] - Update student (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = parseInt(id, 10);

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

    const { data: updatedStudent, error } = await supabase
      .from("students")
      .update({ name, class: className, halaqah_id: parseInt(halaqah_id, 10) })
      .eq("id", studentId)
      .select("id, name, class, halaqah_id, halaqah(name)")
      .single();

    if (error) throw error;

    const formattedStudent = {
      id: updatedStudent.id,
      name: updatedStudent.name,
      class: updatedStudent.class,
      halaqah_id: updatedStudent.halaqah_id,
      halaqah_name: updatedStudent.halaqah ? (updatedStudent.halaqah as any).name : "N/A",
    };

    return NextResponse.json({ student: formattedStudent });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete student (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = parseInt(id, 10);

    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("students").delete().eq("id", studentId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
