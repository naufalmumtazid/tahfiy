async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
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
