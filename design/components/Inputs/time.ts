export interface Time24 {
  hour: number;
  minute: number;
}

export type Period = 'am' | 'pm';

export function to12h(t: Time24): { hour: number; minute: number; period: Period } {
  const period: Period = t.hour < 12 ? 'am' : 'pm';
  const hour = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return { hour, minute: t.minute, period };
}

export function from12h(hour: number, minute: number, period: Period): Time24 | null {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  if (period !== 'am' && period !== 'pm') return null;
  return { hour: (hour % 12) + (period === 'pm' ? 12 : 0), minute };
}

export function formatTime12(t: Time24, am: string, pm: string): string {
  const h = to12h(t);
  const suffix = h.period === 'am' ? am : pm;
  return `${h.hour}:${String(h.minute).padStart(2, '0')} ${suffix}`;
}
