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

// GET /api/teachers - Fetch all teachers
export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("ustadz")
      .select("id, name")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ teachers: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// POST /api/teachers - Create a new teacher (Admin only)
export async function POST(request: Request) {
  try {
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

    const { data: newTeacher, error } = await supabase
      .from("ustadz")
      .insert([{ name }])
      .select("id, name")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        teacher: {
          id: newTeacher.id,
          name: newTeacher.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
