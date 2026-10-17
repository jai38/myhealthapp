import { describe, it, expect } from 'vitest';
import { formatTime12Hour, getTimePeriodIcon } from '../features/medications/reminder-time-utils';

describe('CustomTimePicker Logic & Time Utilities', () => {
  const to24Hour = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let h24 = hour;
    if (period === 'PM' && h24 !== 12) h24 += 12;
    if (period === 'AM' && h24 === 12) h24 = 0;
    const hh = String(h24).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  it('converts 12h morning times to 24h format', () => {
    expect(to24Hour(8, 0, 'AM')).toBe('08:00');
    expect(to24Hour(7, 30, 'AM')).toBe('07:30');
    expect(to24Hour(11, 45, 'AM')).toBe('11:45');
    expect(to24Hour(12, 0, 'AM')).toBe('00:00'); // Midnight
  });

  it('converts 12h evening/night times to 24h format', () => {
    expect(to24Hour(12, 0, 'PM')).toBe('12:00'); // Noon
    expect(to24Hour(1, 15, 'PM')).toBe('13:15');
    expect(to24Hour(6, 0, 'PM')).toBe('18:00');
    expect(to24Hour(7, 30, 'PM')).toBe('19:30');
    expect(to24Hour(11, 30, 'PM')).toBe('23:30');
  });

  it('formats 24h time back to 12h display strings accurately', () => {
    expect(formatTime12Hour('08:00')).toBe('8:00 AM');
    expect(formatTime12Hour('07:30')).toBe('7:30 AM');
    expect(formatTime12Hour('12:00')).toBe('12:00 PM');
    expect(formatTime12Hour('18:00')).toBe('6:00 PM');
    expect(formatTime12Hour('23:30')).toBe('11:30 PM');
    expect(formatTime12Hour('00:00')).toBe('12:00 AM');
  });

  it('maps times to correct day period icons', () => {
    expect(getTimePeriodIcon('08:00')).toBe('🌅'); // Morning
    expect(getTimePeriodIcon('13:00')).toBe('☀️'); // Afternoon
    expect(getTimePeriodIcon('18:00')).toBe('🌇'); // Evening
    expect(getTimePeriodIcon('22:00')).toBe('🌙'); // Night
  });
});
