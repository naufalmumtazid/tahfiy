import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/database/supabase/server";
import { verifyJWT } from "@/utils/jwt";

// Helper to check if the current requester is an admin
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

// GET /api/students - Retrieve all students (Admin/Ustadz can read, but let's require admin for management)
export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Retrieve students joining halaqah details
    const { data: studentsData, error } = await supabase
      .from("students")
      .select("id, name, class, halaqah_id, halaqah(name)")
      .order("id", { ascending: true });

    if (error) throw error;

    // Format output
    const students = (studentsData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      class: s.class,
      halaqah_id: s.halaqah_id,
      halaqah_name: s.halaqah ? s.halaqah.name : "N/A",
    }));

    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student (Admin only)
export async function POST(request: Request) {
  try {
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

    // Insert student
    const { data: newStudent, error } = await supabase
      .from("students")
      .insert([
        {
          name,
          class: className,
          halaqah_id: parseInt(halaqah_id, 10),
        },
      ])
      .select("id, name, class, halaqah_id, halaqah(name)")
      .single();

    if (error) throw error;

    const formattedStudent = {
      id: newStudent.id,
      name: newStudent.name,
      class: newStudent.class,
      halaqah_id: newStudent.halaqah_id,
      halaqah_name: newStudent.halaqah ? (newStudent.halaqah as any).name : "N/A",
    };

    return NextResponse.json({ student: formattedStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
