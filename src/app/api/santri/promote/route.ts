import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getErrorMessage } from "@/utils/error";
import { verifyJWT } from "@/utils/jwt";

const ALLOWED_ROLES = ["admin", "ustadz"];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const userRole = payload?.role as string | undefined;

    if (!payload || !ALLOWED_ROLES.includes(userRole || "")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { halaqah_id, class_prefix } = body;

    if (!halaqah_id || !class_prefix) {
      return NextResponse.json({ error: "halaqah_id and class_prefix are required" }, { status: 400 });
    }

    const supabase = createClient(cookieStore);

    // If caller is ustadz, ensure target halaqah belongs to him
    if (userRole === "ustadz") {
      const { data: ustadzRows } = await supabase.from("ustadz").select("id").eq("user_id", payload.userId).limit(1);
      const ustadzId = Array.isArray(ustadzRows) && ustadzRows[0] ? (ustadzRows[0] as Record<string, unknown>).id : null;
      if (!ustadzId) return NextResponse.json({ error: "Ustadz not found" }, { status: 403 });

      const { data: halaqahRows } = await supabase.from("halaqah").select("id").eq("ustadz_id", ustadzId).eq("id", halaqah_id);
      if (!halaqahRows || halaqahRows.length === 0) {
        return NextResponse.json({ error: "Unauthorized to modify this halaqah" }, { status: 403 });
      }
    }

    // fetch santri in the given halaqah with class starting with prefix and active = true
    const { data: santriRows, error } = await supabase
      .from("santri")
      .select("id, class, user_id")
      .eq("halaqah_id", halaqah_id)
      .like("class", `${class_prefix}%`)
      .eq("active", true);

    if (error) throw error;

    const rows = santriRows || [];
    const updated: Array<{ id: number; action: string; newClass?: string }> = [];

    for (const r of rows) {
      const id = (r as Record<string, unknown>).id as number;
      const cls = ((r as Record<string, unknown>).class as string) || "";
      const m = cls.match(/^(\d{1,2})(.*)$/);
      if (!m) continue; // skip if class doesn't start with number

      const num = Number(m[1]);
      const suffix = m[2] || "";

      if (num >= 12) {
        // mark inactive
        const { error: updErr } = await supabase.from("santri").update({ active: false }).eq("id", id);
        if (updErr) throw updErr;
        updated.push({ id, action: "set_inactive" });
      } else {
        const newClass = `${num + 1}${suffix}`;
        const { error: updErr } = await supabase.from("santri").update({ class: newClass }).eq("id", id);
        if (updErr) throw updErr;
        updated.push({ id, action: "promoted", newClass });
      }
    }

    return NextResponse.json({ updated });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) || "An error occurred" }, { status: 500 });
  }
}
