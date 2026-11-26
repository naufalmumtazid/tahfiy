export interface MonthWeek {
  index: number;
  weekStart: string;
  startDate: string;
  endDate: string;
}

export function getCurrentMonthStart(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}-01`;
}

export function shiftMonth(monthStart: string, amount: number): string {
  const date = new Date(`${monthStart}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 10);
}

export function getMonthWeeks(monthStart: string): MonthWeek[] {
  const firstDay = new Date(`${monthStart}T00:00:00.000Z`);
  const year = firstDay.getUTCFullYear();
  const month = firstDay.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const firstWeekDay = new Date(firstDay);
  firstWeekDay.setUTCDate(
    firstWeekDay.getUTCDate() - ((firstWeekDay.getUTCDay() + 6) % 7),
  );

  const weeks: MonthWeek[] = [];
  for (
    const weekStart = firstWeekDay;
    weekStart <= lastDay;
    weekStart.setUTCDate(weekStart.getUTCDate() + 7)
  ) {
    const weekBelongsToMonth = new Date(weekStart);
    weekBelongsToMonth.setUTCDate(weekBelongsToMonth.getUTCDate() + 3);
    if (weekBelongsToMonth < firstDay || weekBelongsToMonth > lastDay) {
      continue;
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    weeks.push({
      index: weeks.length + 1,
      weekStart: weekStart.toISOString().slice(0, 10),
      startDate: weekStart.toISOString().slice(0, 10),
      endDate: weekEnd.toISOString().slice(0, 10),
    });
  }

  return weeks;
}

export function formatMonth(monthStart: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthStart}T00:00:00.000Z`));
}
