import type { SantriDashboardData } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchSantriDashboardData(
  monthStart: string,
): Promise<SantriDashboardData> {
  const query = new URLSearchParams({ month: monthStart });
  const response = await fetch(`/api/santri/dashboard?${query}`);
  return handleJson<SantriDashboardData>(response);
}

export async function fetchWeeklyExam(
  santriId: number,
  weekStart: string,
): Promise<boolean> {
  const query = new URLSearchParams({
    santri_id: String(santriId),
    week_start: weekStart,
  });
  const response = await fetch(`/api/ujian-mingguan?${query}`);
  const data = await handleJson<{ passed: boolean }>(response);
  return data.passed;
}

export async function fetchSantriWeeklyExams(
  weekStarts: string[],
): Promise<Record<string, boolean>> {
  const query = new URLSearchParams({
    week_starts: weekStarts.join(","),
  });
  const response = await fetch(`/api/ujian-mingguan?${query}`);
  const data = await handleJson<{
    passedWeeks: Record<string, boolean>;
  }>(response);
  return data.passedWeeks;
}

export async function markWeeklyExamPassed(
  santriId: number,
  weekStart: string,
): Promise<void> {
  const response = await fetch("/api/ujian-mingguan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ santri_id: santriId, week_start: weekStart }),
  });
  await handleJson<{ passed: boolean }>(response);
}

export async function undoWeeklyExamPassed(
  santriId: number,
  weekStart: string,
): Promise<void> {
  const query = new URLSearchParams({
    santri_id: String(santriId),
    week_start: weekStart,
  });
  const response = await fetch(`/api/ujian-mingguan?${query}`, {
    method: "DELETE",
  });
  await handleJson<{ passed: boolean }>(response);
}
