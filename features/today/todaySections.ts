// Pure section plan and helpers for the Today screen. No React, no clock reads.
import type { MedicineForm } from '../../design/components/Foundations/iconNames';
import type { MedicationRecord } from '../../services/medications/medication-service';
import type { GroupedTodayDoses, TodayDose, TodayScreenState } from './todayModel';

export type TodaySection =
  | 'loading'
  | 'error'
  | 'newUser'
  | 'nothingDue'
  | 'allDone'
  | 'next'
  | 'dueNow'
  | 'earlierNotConfirmed'
  | 'later'
  | 'done'
  | 'asNeeded'
  | 'quickActions';

/** Local time for dose rows and the hero, e.g. "8:00 AM". */
export function formatTodayTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Due-now doses other than the next dose (which has its own hero card). */
export function dueNowRest(groups: GroupedTodayDoses): TodayDose[] {
  const nextId = groups.next?.dose.id;
  return groups.dueNow.filter((d) => d.dose.id !== nextId);
}

/**
 * Sections that show on the Today screen, in order. Quick actions are hidden
 * for a new user because the empty state already offers the same two actions.
 */
export function todaySections(
  screenState: TodayScreenState,
  groups: GroupedTodayDoses,
  hasAsNeeded = false,
): TodaySection[] {
  switch (screenState) {
    case 'loading':
      return ['loading'];
    case 'error':
      return ['error'];
    case 'newUser':
      return ['newUser'];
    case 'nothingDue':
      return ['nothingDue', ...trailingSections(hasAsNeeded)];
    case 'allDone': {
      const out: TodaySection[] = ['allDone'];
      if (groups.done.length > 0) out.push('done');
      return [...out, ...trailingSections(hasAsNeeded)];
    }
    case 'due': {
      const out: TodaySection[] = [];
      if (groups.next) out.push('next');
      if (dueNowRest(groups).length > 0) out.push('dueNow');
      if (groups.earlierNotConfirmed.length > 0) out.push('earlierNotConfirmed');
      if (groups.later.length > 0) out.push('later');
      if (groups.done.length > 0) out.push('done');
      return [...out, ...trailingSections(hasAsNeeded)];
    }
    default: {
      const unhandled: never = screenState;
      return unhandled;
    }
  }
}

function trailingSections(hasAsNeeded: boolean): TodaySection[] {
  return hasAsNeeded ? ['asNeeded', 'quickActions'] : ['quickActions'];
}

/**
 * Active medicines with no reminder times, or whose instructions say "as needed" or "SOS".
 * These are taken on demand, so they never show as a due dose.
 */
export function asNeededMedications(meds: MedicationRecord[]): MedicationRecord[] {
  return meds.filter(
    (m) =>
      m.status === 'ACTIVE' &&
      (!m.reminderTimes ||
        m.reminderTimes.length === 0 ||
        m.prescribedInstructions?.toLowerCase().includes('as needed') ||
        m.prescribedInstructions?.toLowerCase().includes('sos')),
  );
}

/** Icon shape for a medicine, from its recorded dosage form. Unknown forms get "other". */
export function medicineFormFor(dosageForm: string | null | undefined): MedicineForm {
  const f = (dosageForm ?? '').toLowerCase();
  if (f.includes('syrup') || f.includes('liquid') || f.includes('suspension')) return 'liquid';
  if (f.includes('drop')) return 'drops';
  if (f.includes('inject')) return 'injection';
  if (f.includes('inhal')) return 'inhaler';
  if (f.includes('cream') || f.includes('ointment') || f.includes('gel') || f.includes('lotion')) {
    return 'topical';
  }
  if (f.includes('capsule')) return 'capsule';
  if (f.includes('tablet')) return 'tablet';
  return 'other';
}
