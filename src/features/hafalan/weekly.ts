export interface WeekRange {
  start: string;
  end: string;
}

export interface PageCountSummary {
  total: number;
  uncounted: number;
}

export function summarizePages(
  records: Array<{ jumlah_halaman: number | null }>,
): PageCountSummary {
  return records.reduce<PageCountSummary>(
    (summary, record) => {
      if (record.jumlah_halaman == null) {
        summary.uncounted += 1;
      } else {
        summary.total += record.jumlah_halaman;
      }
      return summary;
    },
    { total: 0, uncounted: 0 },
  );
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekStart(): string {
  const date = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export function shiftWeek(weekStart: string, amount: number): string {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount * 7);
  return date.toISOString().slice(0, 10);
}

export function getWeekRange(weekStart: string): WeekRange {
  const end = new Date(`${weekStart}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  return { start: weekStart, end: end.toISOString().slice(0, 10) };
}

export function isMondayDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date.getUTCDay() === 1
  );
}

export function formatWeekRange(weekStart: string): string {
  const { start, end } = getWeekRange(weekStart);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00.000Z`));
  const year = new Date(`${end}T00:00:00.000Z`).getUTCFullYear();
  return `Pekan ${formatDate(start)}–${formatDate(end)} ${year}`;
}

export function formatHafalanDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function getDefaultHafalanDate(date = new Date()): string {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (result.getDay() === 6) result.setDate(result.getDate() - 1);
  return toDateString(result);
}
