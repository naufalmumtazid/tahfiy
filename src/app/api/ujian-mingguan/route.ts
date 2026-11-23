import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/database/supabase/server";
import { checkIsAuthorized } from "@/utils/auth";
import { getErrorMessage } from "@/utils/error";
import { isMondayDate } from "@/features/hafalan/weekly";

const examRequestSchema = z.object({
  santri_id: z.coerce.number().int().positive(),
  week_start: z.string().refine(isMondayDate, "Pekan harus dimulai pada hari Senin"),
});

const ALLOWED_ROLES = ["admin", "ustadz"];

function parseQuery(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  return examRequestSchema.safeParse({
    santri_id: searchParams.get("santri_id"),
    week_start: searchParams.get("week_start"),
  });
}

export async function GET(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const parsed = parseQuery(request);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parameter santri dan pekan tidak valid." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("ujian_mingguan")
      .select("santri_id")
      .eq("santri_id", parsed.data.santri_id)
      .eq("week_start", parsed.data.week_start)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ passed: Boolean(data) });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
    }
    const parsed = examRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Santri atau pekan ujian tidak valid." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.from("ujian_mingguan").upsert(
      {
        santri_id: parsed.data.santri_id,
        week_start: parsed.data.week_start,
        passed_at: new Date().toISOString(),
      },
      { onConflict: "santri_id,week_start" },
    );

    if (error) throw error;
    return NextResponse.json({ passed: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuthorized = await checkIsAuthorized(ALLOWED_ROLES);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const parsed = parseQuery(request);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parameter santri dan pekan tidak valid." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
      .from("ujian_mingguan")
      .delete()
      .eq("santri_id", parsed.data.santri_id)
      .eq("week_start", parsed.data.week_start);

    if (error) throw error;
    return NextResponse.json({ passed: false });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
