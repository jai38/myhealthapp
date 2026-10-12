import { describe, it, expect } from 'vitest';
import {
  DiscreteOccurrenceScheduler,
  MedicationScheduleOccurrence,
} from '../services/notifications/actual-count-scheduler';

describe('DiscreteOccurrenceScheduler', () => {
  const baseDate = new Date('2026-10-15T08:00:00Z');

  const generateOccurrences = (count: number): MedicationScheduleOccurrence[] => {
    const list: MedicationScheduleOccurrence[] = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        scheduleId: `sched_${i % 3}`,
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: new Date(baseDate.getTime() + i * 4 * 60 * 60 * 1000), // Every 4 hours
      });
    }
    return list;
  };

  it('caps scheduled occurrences to exact iOS limit (60) when given 120 occurrences', () => {
    const scheduler = new DiscreteOccurrenceScheduler('ios');
    const allOccurrences = generateOccurrences(120);

    const schedulable = scheduler.projectSchedulableOccurrences(allOccurrences, baseDate);

    expect(schedulable.length).toBe(60);
    // Verify sorted chronologically
    expect(schedulable[0]!.scheduledTime.getTime()).toBeLessThan(
      schedulable[schedulable.length - 1]!.scheduledTime.getTime()
    );
  });

  it('caps scheduled occurrences to Android limit (100) when given 120 occurrences', () => {
    const scheduler = new DiscreteOccurrenceScheduler('android');
    const allOccurrences = generateOccurrences(120);

    const schedulable = scheduler.projectSchedulableOccurrences(allOccurrences, baseDate);

    expect(schedulable.length).toBe(100);
  });

  it('discards past occurrences and schedules only future ones', () => {
    const scheduler = new DiscreteOccurrenceScheduler('ios');
    const pastOccurrence: MedicationScheduleOccurrence = {
      scheduleId: 's1',
      medicationName: 'Aspirin',
      dosage: '75mg',
      scheduledTime: new Date(baseDate.getTime() - 10000), // 10s in past
    };
    const futureOccurrence: MedicationScheduleOccurrence = {
      scheduleId: 's1',
      medicationName: 'Aspirin',
      dosage: '75mg',
      scheduledTime: new Date(baseDate.getTime() + 10000), // 10s in future
    };

    const schedulable = scheduler.projectSchedulableOccurrences(
      [pastOccurrence, futureOccurrence],
      baseDate
    );

    expect(schedulable.length).toBe(1);
    expect(schedulable[0]!.scheduledTime.getTime()).toBe(futureOccurrence.scheduledTime.getTime());
  });

  it('correctly formats privacy-preserving notification payloads without drug names', () => {
    const scheduler = new DiscreteOccurrenceScheduler('ios');
    const occurrences = generateOccurrences(2);
    const payloads = scheduler.formatNotificationPayloads(occurrences);

    expect(payloads.length).toBe(2);
    expect(payloads[0]!.title).toBe('Medication Reminder');
    expect(payloads[0]!.body).not.toContain('Metformin'); // Privacy check
  });

  it('accurately identifies when replenishment is needed', () => {
    const scheduler = new DiscreteOccurrenceScheduler('ios');
    // For iOS cap 60, 20% is 12
    expect(scheduler.needsReplenishment(10)).toBe(true);
    expect(scheduler.needsReplenishment(25)).toBe(false);
  });
});
