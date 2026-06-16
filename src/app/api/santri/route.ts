import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/database/supabase/server";
import { verifyJWT } from "@/utils/jwt";
import { getErrorMessage } from "@/utils/error";
import bcrypt from "bcryptjs";

function generateUsername(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

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

    const { data: santriData, error } = await supabase
      .from("santri")
      .select("id, user_id, class, halaqah_id, halaqah(name), users(name)")
      .order("id", { ascending: true });

    if (error) throw error;

    type SantriRow = {
      id: number;
      user_id: number;
      class: string;
      halaqah_id: number;
      users?: { name?: string };
      halaqah?: { name?: string };
    };

    const santri = ((santriData || []) as SantriRow[]).map((s) => ({
      id: s.id,
      user_id: s.user_id,
      name: s.users?.name || "",
      class: s.class,
      halaqah_id: s.halaqah_id,
      halaqah_name: s.halaqah ? s.halaqah.name : "N/A",
    }));

    return NextResponse.json({ santri });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || "An error occurred" },
      { status: 500 }
    );
  }
}

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

    const username = generateUsername(name);
    const password = "santri";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: hashedPassword,
          role: "santri",
          name,
        },
      ])
      .select("id")
      .single();

    if (userError || !newUser) {
      throw userError || new Error("Failed to create user for santri.");
    }

    const { data: newSantri, error: santriError } = await supabase
      .from("santri")
      .insert([
        {
          user_id: newUser.id,
          class: className,
          halaqah_id: parseInt(halaqah_id, 10),
        },
      ])
      .select("id, user_id, class, halaqah_id, halaqah(name), users(name)")
      .single();

    if (santriError || !newSantri) {
      await supabase.from("users").delete().eq("id", newUser.id);
      throw santriError || new Error("Failed to create santri entry.");
    }

    
    const formattedSantri = {
      id: newSantri.id,
      user_id: newSantri.user_id,
      name: (newSantri.users as unknown as {name: string})?.name || "",
      class: newSantri.class,
      halaqah_id: newSantri.halaqah_id,
      halaqah_name: newSantri.halaqah ? (newSantri.halaqah as unknown as {name: string}).name : "N/A",
    };

    return NextResponse.json({ santri: formattedSantri }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
