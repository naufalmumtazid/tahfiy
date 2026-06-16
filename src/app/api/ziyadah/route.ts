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

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: ziyadahData, error } = await supabase
      .from("ziyadah")
      .select(
        `id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))`
      )
      .order("id", { ascending: true });

    if (error) throw error;

    type ZiyadahRow = {
      id: number;
      santri_id: number;
      date: string;
      juz: number;
      start_page: number;
      end_page: number;
      santri?: Array<{
        class?: string;
        halaqah?: Array<{ name?: string }>;
        users?: Array<{ name?: string }>;
      }>;
    };

    const ziyadah = ((ziyadahData || []) as ZiyadahRow[]).map((z) => ({
      id: z.id,
      santri_id: z.santri_id,
      date: z.date,
      juz: z.juz,
      start_page: z.start_page,
      end_page: z.end_page,
      name: z.santri?.[0]?.users?.[0]?.name ?? "",
      class: z.santri?.[0]?.class || "",
      halaqah_name: z.santri?.[0]?.halaqah?.[0]?.name || "",
    }));

    return NextResponse.json({ ziyadah });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const { data: newZiyadah, error } = await supabase
      .from("ziyadah")
      .insert([
        {
          santri_id: parseInt(santri_id, 10),
          date,
          juz: parseInt(juz, 10),
          start_page: parseInt(start_page, 10),
          end_page: parseInt(end_page, 10),
        },
      ])
      .select("id, santri_id, date, juz, start_page, end_page, santri(id, class, halaqah(name), users(name))")
      .single();

    if (error || !newZiyadah) {
      throw error || new Error("Failed to create ziyadah.");
    }

    const formatted = {
      id: newZiyadah.id,
      santri_id: newZiyadah.santri_id,
      date: newZiyadah.date,
      juz: newZiyadah.juz,
      start_page: newZiyadah.start_page,
      end_page: newZiyadah.end_page,
      name: newZiyadah.santri?.[0]?.users?.[0]?.name ?? "",
      class: newZiyadah.santri?.[0]?.class || "",
      halaqah_name: newZiyadah.santri?.[0]?.halaqah?.[0]?.name || "",
    };

    return NextResponse.json({ ziyadah: formatted }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
