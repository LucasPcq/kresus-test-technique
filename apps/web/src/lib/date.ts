import { CalendarDate } from "@internationalized/date";

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export function formatDateShort(date: Date, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, SHORT_DATE_OPTIONS).format(date);
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
