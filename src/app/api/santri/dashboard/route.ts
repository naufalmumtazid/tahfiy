import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/database/supabase/server";
import { getMonthWeeks } from "@/features/hafalan/monthly";
import type {
  HafalanProgressEntry,
  SantriDashboardData,
} from "@/features/hafalan/types";
import { getErrorMessage } from "@/utils/error";
import { verifyJWT } from "@/utils/jwt";

function getRecord(value: unknown): Record<string, unknown> | null {
  const record = Array.isArray(value) ? value[0] : value;
  return record !== null && typeof record === "object"
    ? (record as Record<string, unknown>)
    : null;
}

function formatProgressEntries(data: unknown): HafalanProgressEntry[] {
  if (!Array.isArray(data)) return [];

  return data.map((value) => {
    const row = getRecord(value);
    return {
      date: String(row?.date ?? ""),
      jumlah_halaman:
        row?.jumlah_halaman == null ? null : Number(row.jumlah_halaman),
    };
  });
}

function getFirstDate(data: unknown): string | null {
  const row = Array.isArray(data) ? getRecord(data[0]) : null;
  return typeof row?.date === "string" ? row.date : null;
}

export async function GET(request: Request) {
  try {
    const monthStart = new URL(request.url).searchParams.get("month");
    const parsedMonth = monthStart
      ? new Date(`${monthStart}T00:00:00.000Z`)
      : null;

    if (
      !monthStart ||
      !/^\d{4}-\d{2}-01$/.test(monthStart) ||
      !parsedMonth ||
      Number.isNaN(parsedMonth.getTime()) ||
      parsedMonth.toISOString().slice(0, 10) !== monthStart
    ) {
      return NextResponse.json(
        { error: "Parameter bulan tidak valid." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyJWT(token) : null;
    if (!payload || payload.role !== "santri") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const weeks = getMonthWeeks(monthStart);
    const firstWeek = weeks[0];
    const lastWeek = weeks[weeks.length - 1];
    if (!firstWeek || !lastWeek) {
      return NextResponse.json(
        { error: "Rentang pekan pada bulan tidak valid." },
        { status: 400 },
      );
    }

    const supabase = createClient(cookieStore);
    const { data: santriData, error: santriError } = await supabase
      .from("santri")
      .select("id, class, halaqah(name)")
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (santriError) throw santriError;
    if (!santriData) {
      return NextResponse.json(
        { error: "Data santri tidak ditemukan." },
        { status: 404 },
      );
    }

    const santri = getRecord(santriData);
    if (!santri || typeof santri.id !== "number") {
      throw new Error("Data santri tidak valid.");
    }

    const [
      murojaahResult,
      ziyadahResult,
      latestMurojaahResult,
      latestZiyadahResult,
    ] = await Promise.all([
      supabase
        .from("murojaah")
        .select("date, jumlah_halaman")
        .eq("santri_id", santri.id)
        .gte("date", firstWeek.startDate)
        .lte("date", lastWeek.endDate),
      supabase
        .from("ziyadah")
        .select("date, jumlah_halaman")
        .eq("santri_id", santri.id)
        .gte("date", firstWeek.startDate)
        .lte("date", lastWeek.endDate),
      supabase
        .from("murojaah")
        .select("date")
        .eq("santri_id", santri.id)
        .order("date", { ascending: false })
        .limit(1),
      supabase
        .from("ziyadah")
        .select("date")
        .eq("santri_id", santri.id)
        .order("date", { ascending: false })
        .limit(1),
    ]);

    const activityError =
      murojaahResult.error ??
      ziyadahResult.error ??
      latestMurojaahResult.error ??
      latestZiyadahResult.error;
    if (activityError) throw activityError;

    const latestMurojaahDate = getFirstDate(latestMurojaahResult.data);
    const latestZiyadahDate = getFirstDate(latestZiyadahResult.data);
    let latestActivity: SantriDashboardData["latestActivity"] = null;
    if (
      latestMurojaahDate &&
      (!latestZiyadahDate || latestMurojaahDate >= latestZiyadahDate)
    ) {
      latestActivity = {
        activityType: "Murojaah",
        date: latestMurojaahDate,
      };
    } else if (latestZiyadahDate) {
      latestActivity = {
        activityType: "Ziyadah",
        date: latestZiyadahDate,
      };
    }

    const halaqah = getRecord(santri.halaqah);
    const result: SantriDashboardData = {
      user: {
        userId: payload.userId,
        username: payload.username,
        name: payload.name,
        role: "santri",
      },
      identity: {
        class: typeof santri.class === "string" ? santri.class : null,
        halaqah_name:
          typeof halaqah?.name === "string" ? halaqah.name : null,
      },
      murojaah: formatProgressEntries(murojaahResult.data),
      ziyadah: formatProgressEntries(ziyadahResult.data),
      latestActivity,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || "An error occurred" },
      { status: 500 },
    );
  }
}
