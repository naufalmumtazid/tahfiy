import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/database/supabase/server";
import { checkIsAuthorized } from "@/utils/auth";
import { getErrorMessage } from "@/utils/error";
import { verifyJWT } from "@/utils/jwt";
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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    const allowedGetRoles = [...ALLOWED_ROLES, "santri"];
    if (!payload || !allowedGetRoles.includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const searchParams = new URL(request.url).searchParams;
    const weekStartsParam = searchParams.get("week_starts");
    const weekStarts = weekStartsParam?.split(",") ?? [];
    const weekStart = searchParams.get("week_start");
    const isBatchRequest = weekStartsParam !== null;

    if (isBatchRequest && payload.role !== "santri") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    if (
      isBatchRequest &&
      (weekStarts.length < 1 ||
        weekStarts.length > 6 ||
        new Set(weekStarts).size !== weekStarts.length ||
        !weekStarts.every(isMondayDate))
    ) {
      return NextResponse.json(
        { error: "Parameter pekan tidak valid." },
        { status: 400 },
      );
    }

    if (!isBatchRequest && (!weekStart || !isMondayDate(weekStart))) {
      return NextResponse.json({ error: "Parameter pekan tidak valid." }, { status: 400 });
    }

    const supabase = createClient(cookieStore);
    let santriId: number;

    if (payload.role === "santri") {
      const { data: santri, error: santriError } = await supabase
        .from("santri")
        .select("id")
        .eq("user_id", payload.userId)
        .maybeSingle();

      if (santriError) throw santriError;
      if (!santri) {
        return NextResponse.json({ error: "Data santri tidak ditemukan." }, { status: 403 });
      }

      const requestedSantriId = searchParams.get("santri_id");
      if (
        requestedSantriId &&
        Number(requestedSantriId) !== Number(santri.id)
      ) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }
      santriId = Number(santri.id);
    } else {
      const parsed = examRequestSchema.safeParse({
        santri_id: searchParams.get("santri_id"),
        week_start: weekStart,
      });
      if (!parsed.success) {
        return NextResponse.json({ error: "Parameter santri dan pekan tidak valid." }, { status: 400 });
      }
      santriId = parsed.data.santri_id;
    }

    if (isBatchRequest) {
      const { data, error } = await supabase
        .from("ujian_mingguan")
        .select("week_start")
        .eq("santri_id", santriId)
        .in("week_start", weekStarts);

      if (error) throw error;

      const passedWeeks: Record<string, boolean> = Object.fromEntries(
        weekStarts.map((start) => [start, false]),
      );
      for (const row of data ?? []) {
        passedWeeks[String(row.week_start)] = true;
      }

      return NextResponse.json({ passedWeeks });
    }

    if (!weekStart) {
      return NextResponse.json(
        { error: "Parameter pekan tidak valid." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("ujian_mingguan")
      .select("santri_id")
      .eq("santri_id", santriId)
      .eq("week_start", weekStart)
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
