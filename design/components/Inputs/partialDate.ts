export type DatePrecision = 'year' | 'month' | 'day';

export interface PartialDate {
  year: number;
  month?: number;
  day?: number;
}

export interface DateFields {
  day: string;
  month: string;
  year: string;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function precisionOf(d: PartialDate): DatePrecision {
  if (d.day !== undefined) return 'day';
  if (d.month !== undefined) return 'month';
  return 'year';
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (!isInt(month, 1, 12)) return 0;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return MONTH_DAYS[month - 1];
}

function isInt(n: unknown, min: number, max: number): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
}

export function validatePartialDate(d: PartialDate): boolean {
  if (!isInt(d.year, MIN_YEAR, MAX_YEAR)) return false;
  if (d.month === undefined) return d.day === undefined;
  if (!isInt(d.month, 1, 12)) return false;
  if (d.day === undefined) return true;
  return isInt(d.day, 1, daysInMonth(d.year, d.month));
}

// Digits only, after trimming. Anything else is NaN and fails validation.
function parseField(raw: string): number {
  const s = raw.trim();
  return /^\d+$/.test(s) ? Number(s) : NaN;
}

// Reads only the parts the precision needs. A missing part is never defaulted.
export function buildPartialDate(
  precision: DatePrecision,
  fields: DateFields,
): PartialDate | null {
  const year = parseField(fields.year);
  if (!Number.isFinite(year)) return null;
  const d: PartialDate = { year };
  if (precision !== 'year') {
    const month = parseField(fields.month);
    if (!Number.isFinite(month)) return null;
    d.month = month;
  }
  if (precision === 'day') {
    const day = parseField(fields.day);
    if (!Number.isFinite(day)) return null;
    d.day = day;
  }
  return validatePartialDate(d) ? d : null;
}

export function formatPartialDate(d: PartialDate, monthLabel: (m: number) => string): string {
  const parts: string[] = [];
  if (d.day !== undefined) parts.push(String(d.day));
  if (d.month !== undefined) parts.push(monthLabel(d.month));
  parts.push(String(d.year));
  return parts.join(' ');
}
