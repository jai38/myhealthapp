/**
 * Utility functions for friendly 12-hour / 24-hour medication reminder time formatting.
 */

export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const formattedM = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${formattedM} ${period}`;
}

export function getTimePeriodIcon(time24: string): string {
  if (!time24 || !time24.includes(':')) return '⏰';
  const h = parseInt(time24.split(':')[0] || '0', 10);
  if (h >= 5 && h < 12) return '🌅';
  if (h >= 12 && h < 17) return '☀️';
  if (h >= 17 && h < 21) return '🌇';
  return '🌙';
}

export const FREQUENCY_PRESETS = [
  { label: 'Once daily', count: 1, times: ['09:00'] },
  { label: 'Twice daily', count: 2, times: ['09:00', '21:00'] },
  { label: '3x daily', count: 3, times: ['08:00', '14:00', '20:00'] },
  { label: '4x daily', count: 4, times: ['08:00', '12:00', '17:00', '21:00'] },
] as const;

export const QUICK_TIME_PRESETS = [
  { time: '08:00', label: 'Morning', icon: '🌅', display: '8:00 AM' },
  { time: '13:00', label: 'Lunch / Noon', icon: '☀️', display: '1:00 PM' },
  { time: '18:00', label: 'Evening', icon: '🌇', display: '6:00 PM' },
  { time: '21:00', label: 'Bedtime', icon: '🌙', display: '9:00 PM' },
] as const;
