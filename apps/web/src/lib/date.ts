import { CalendarDate } from "@internationalized/date";

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateShort(date: Date): string {
  return shortDateFormatter.format(date);
}

export function parseLocalDate(iso: string): Date {
  const [year, month, day, ...rest] = iso.split("-").map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid ISO date: "${iso}"`);
  }

  return new Date(year, month - 1, day);
}

export function parseIsoToCalendarDate(iso: string): CalendarDate {
  const [year, month, day] = iso.split("-").map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid ISO date: "${iso}"`);
  }

  return new CalendarDate(year, month, day);
}
