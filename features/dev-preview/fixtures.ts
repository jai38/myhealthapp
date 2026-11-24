// DEV ONLY. Synthetic fixtures for the screen preview. Everything here is invented:
// medicines are called "Testmed ...", the user is "Asha Test", the email is on the
// reserved .invalid domain. None of it is, or was derived from, real patient data.
import type { DoseLog, MedicationRecord } from '../../services/medications/medication-service';
import type { TimelineEvent } from '../../services/timeline/timeline-service';
import type { UserSession } from '../../services/auth/auth-service';
import type { PreviewScreen } from './previewGuard';
import type { PreviewDoseDraft, PreviewSeam } from './previewSeam';

/** The frozen clock: Friday 6 November 2026, 10:30 local time. */
export const FROZEN_NOW = { year: 2026, month: 11, day: 6, hour: 10, minute: 30 } as const;

/** Epoch ms of the frozen moment, read in the browser's own time zone. */
export function frozenNowMs(): number {
  const n = FROZEN_NOW;
  return new Date(n.year, n.month - 1, n.day, n.hour, n.minute, 0, 0).getTime();
}

const PATIENT = 'preview-patient';
const STAMP = '2026-11-01T00:00:00.000Z';

export const PREVIEW_SESSION: UserSession = {
  userId: 'preview-user',
  email: 'asha.test@example.invalid',
  fullName: 'Asha Test',
  patientProfileId: PATIENT,
  accessToken: 'preview-not-a-real-token',
  expiresAt: 4_102_444_800, // year 2100: this session never needs a refresh
};

// ---- Dates ---------------------------------------------------------------------------------

/** YYYY-MM-DD for the frozen day plus an offset, with no time-zone arithmetic. */
function dayString(offset: number): string {
  const n = FROZEN_NOW;
  return new Date(Date.UTC(n.year, n.month - 1, n.day + offset)).toISOString().slice(0, 10);
}

/** A zone-less local timestamp, the same shape the app's own store writes. */
function localAt(offset: number, hhmm: string): string {
  return `${dayString(offset)}T${hhmm}:00`;
}

// ---- Medicines -----------------------------------------------------------------------------

function medicine(
  id: string,
  nameAsWritten: string,
  strength: string,
  status: MedicationRecord['status'],
  reminderTimes: string[],
  instructions: string,
): MedicationRecord {
  return {
    id,
    patientProfileId: PATIENT,
    nameAsWritten,
    normalizedMedicineName: null,
    strength,
    dosageForm: 'Oral Tablet',
    route: 'Oral',
    prescribedInstructions: instructions,
    status,
    startDate: STAMP,
    endDate: null,
    reminderTimes: status === 'ACTIVE' ? reminderTimes : null,
    createdAt: STAMP,
    updatedAt: STAMP,
  };
}

const A = medicine('tm-a', 'Testmed A 500 mg', '500 mg', 'ACTIVE', ['08:00', '20:00'], 'Take 1 tablet twice a day.');
const B = medicine('tm-b', 'Testmed B 20 mg', '20 mg', 'ACTIVE', ['10:00'], 'Take 1 tablet in the morning.');
const C = medicine('tm-c', 'Testmed C 10 mg', '10 mg', 'ACTIVE', ['13:00'], 'Take 1 tablet after lunch.');
const D = medicine('tm-d', 'Testmed D 5 mg', '5 mg', 'ACTIVE', ['09:45', '21:30'], 'Take 1 tablet twice a day.');
const E = medicine('tm-e', 'Testmed E 40 mg', '40 mg', 'ACTIVE', ['10:00'], 'Take 1 tablet with water.');
const F = medicine('tm-f', 'Testmed F 250 mg', '250 mg', 'ACTIVE', ['10:15'], 'Take 1 tablet with food.');
// Prescribed but not started: a historical or unconfirmed prescription (CLAUDE.md rule 11).
const P1 = medicine('tm-p1', 'Samplecillin 250 mg', '250 mg', 'INACTIVE', [], 'Course ended; kept as a record.');
const P2 = medicine('tm-p2', 'Demopril 5 mg', '5 mg', 'INACTIVE', [], 'Prescribed; not started.');

const SIX_ACTIVE = [A, B, C, D, E, F];
const ALL_MEDICINES = [...SIX_ACTIVE, P1, P2];

// ---- Doses ---------------------------------------------------------------------------------

type Mark = 'pending' | 'taken' | 'skipped';

function dose(med: MedicationRecord, offset: number, hhmm: string, mark: Mark): DoseLog {
  const actionTime =
    mark === 'taken'
      ? // Recorded five minutes after the scheduled time.
        new Date(new Date(localAt(offset, hhmm)).getTime() + 5 * 60_000).toISOString()
      : null;
  return {
    id: `preview-dose-${med.id}-${dayString(offset)}-${hhmm.replace(':', '')}`,
    medicationId: med.id,
    patientProfileId: PATIENT,
    scheduledTime: localAt(offset, hhmm),
    status: mark === 'taken' ? 'TAKEN' : mark === 'skipped' ? 'SKIPPED' : 'PENDING',
    actionTime,
    snoozeMinutes: null,
    createdAt: STAMP,
    updatedAt: actionTime ?? STAMP,
  };
}

/** Pending doses for each active medicine on the days after the frozen day. */
function comingDays(meds: MedicationRecord[], from = 1, to = 6): DoseLog[] {
  const out: DoseLog[] = [];
  for (let offset = from; offset <= to; offset++) {
    for (const m of meds) for (const time of m.reminderTimes ?? []) out.push(dose(m, offset, time, 'pending'));
  }
  return out;
}

/** Recorded doses on the days before the frozen day. Nothing here is invented as "missed". */
function recentDays(meds: MedicationRecord[]): DoseLog[] {
  const out: DoseLog[] = [];
  for (const offset of [-3, -2, -1]) {
    for (const m of meds) for (const time of m.reminderTimes ?? []) out.push(dose(m, offset, time, 'taken'));
  }
  return out;
}

// One due now, one taken, two later (10:30 is the frozen time).
const DUE_NOW_TODAY: DoseLog[] = [
  dose(A, 0, '08:00', 'taken'),
  dose(B, 0, '10:00', 'pending'),
  dose(C, 0, '13:00', 'pending'),
  dose(A, 0, '20:00', 'pending'),
];

// Three due now, two earlier doses nobody recorded ("Not confirmed"), one taken, three later.
const MANY_DUE_TODAY: DoseLog[] = [
  dose(A, 0, '06:30', 'pending'),
  dose(B, 0, '07:00', 'pending'),
  dose(C, 0, '08:00', 'taken'),
  dose(D, 0, '09:45', 'pending'),
  dose(E, 0, '10:00', 'pending'),
  dose(F, 0, '10:15', 'pending'),
  dose(A, 0, '13:00', 'pending'),
  dose(B, 0, '20:00', 'pending'),
  dose(D, 0, '21:30', 'pending'),
];

// S06 default: one taken, one nobody recorded ("Not confirmed"), one due now, two later.
const RETURNING_TODAY: DoseLog[] = [
  dose(A, 0, '08:00', 'pending'),
  dose(D, 0, '09:00', 'taken'),
  dose(B, 0, '10:00', 'pending'),
  dose(C, 0, '13:00', 'pending'),
  dose(A, 0, '20:00', 'pending'),
];

// Everything scheduled today is recorded.
const ALL_DONE_TODAY: DoseLog[] = [
  dose(A, 0, '07:00', 'taken'),
  dose(B, 0, '08:00', 'taken'),
  dose(C, 0, '09:30', 'skipped'),
];

// ---- Timeline ------------------------------------------------------------------------------

function event(
  n: number,
  eventType: string,
  eventDate: string,
  title: string,
  summary: string,
  extra: Partial<TimelineEvent> = {},
): TimelineEvent {
  return {
    id: `preview-event-${String(n).padStart(2, '0')}`,
    patientProfileId: PATIENT,
    eventType,
    eventDate,
    dateIsUncertain: false,
    datePrecision: 'EXACT',
    title,
    summary,
    sourceDocumentId: null,
    sourcePrescriptionId: null,
    isVerified: true,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...extra,
  };
}

// 12 events over two years, newest first.
export const PREVIEW_EVENTS: TimelineEvent[] = [
  event(12, 'PRESCRIPTION', '2026-10-21', 'Testclinic prescription', 'Three synthetic medicines prescribed.', { sourceDocumentId: 'preview-doc-12', sourcePrescriptionId: 'preview-rx-12' }),
  event(11, 'CONSULTATION', '2026-10-21', 'Testclinic review visit', 'Routine synthetic follow-up.'),
  event(10, 'INVESTIGATION', '2026-08-14', 'Sample lab: blood panel', 'Synthetic result summary, all values in range.', { sourceDocumentId: 'preview-doc-10' }),
  event(9, 'PRESCRIPTION', '2026-05-03', 'Demo hospital prescription', 'Two synthetic medicines prescribed.', { sourceDocumentId: 'preview-doc-09', sourcePrescriptionId: 'preview-rx-09', isVerified: false }),
  event(8, 'PROCEDURE', '2026-02-19', 'Sample minor procedure', 'Synthetic day procedure, no follow-up needed.'),
  event(7, 'CONSULTATION', '2026-01-11', 'Testclinic general visit', 'Synthetic check-up.'),
  event(6, 'INVESTIGATION', '2025-11-27', 'Sample scan report', 'Synthetic imaging summary.', { sourceDocumentId: 'preview-doc-06' }),
  event(5, 'PRESCRIPTION', '2025-09-08', 'Demo hospital prescription', 'One synthetic medicine prescribed.', { sourceDocumentId: 'preview-doc-05', sourcePrescriptionId: 'preview-rx-05' }),
  event(4, 'CONSULTATION', '2025-06', 'Testclinic visit (month only)', 'Exact day was not written on the document.', { datePrecision: 'MONTH_ONLY', dateIsUncertain: true, isVerified: false }),
  event(3, 'INVESTIGATION', '2025-03-30', 'Sample lab: urine test', 'Synthetic result summary.', { sourceDocumentId: 'preview-doc-03' }),
  event(2, 'PROCEDURE', '2025-01-16', 'Sample vaccination', 'Synthetic vaccination record.'),
  event(1, 'CONSULTATION', '2024-11-05', 'Testclinic first visit', 'Synthetic first consultation.'),
];

// ---- Scenarios -----------------------------------------------------------------------------

export interface PreviewScenario {
  /** What the fake `/medications` returns. */
  medications: MedicationRecord[];
  /** What the fake `/medications/doses` returns. */
  doses: DoseLog[];
  /** What the fake `/timeline` filters and pages. */
  events: TimelineEvent[];
  /** True: the fake backend answers every request with a server error. */
  apiFails: boolean;
  /** True: the connectivity context says offline. */
  offline: boolean;
  /** True: an upload is already running when Today opens. */
  uploading: boolean;
  /** True: the fake backend never answers, so the screen stays loading. */
  loading: boolean;
  /** S07: a dose action never answers (saving) or fails (save failed with Retry). */
  actionHangs: boolean;
  actionFails: boolean;
  /** S07: open the Dose update sheet for this dose with this answer chosen. */
  doseUpdate: PreviewSeam['doseUpdate'];
}

const BASE: PreviewScenario = {
  medications: [],
  doses: [],
  events: PREVIEW_EVENTS,
  apiFails: false,
  offline: false,
  uploading: false,
  loading: false,
  actionHangs: false,
  actionFails: false,
  doseUpdate: null,
};

/** The Not confirmed dose in the returning day: Testmed A 500 mg at 08:00. */
export const PREVIEW_NOT_CONFIRMED_DOSE = `preview-dose-tm-a-${dayString(0)}-0800`;

function sheet(draft: Partial<PreviewDoseDraft>): PreviewSeam['doseUpdate'] {
  return { doseId: PREVIEW_NOT_CONFIRMED_DOSE, draft };
}

function withDoses(today: DoseLog[]): Partial<PreviewScenario> {
  return { medications: SIX_ACTIVE, doses: [...today, ...comingDays(SIX_ACTIVE)] };
}

/** The synthetic world for one screen state. Unknown states fall back to the default one. */
export function previewScenario(screen: PreviewScreen, state: string): PreviewScenario {
  if (screen === 'today') {
    switch (state) {
      case 'returning':
      case 'afterTaken':
        return { ...BASE, ...withDoses(RETURNING_TODAY) };
      case 'uploading':
        return { ...BASE, ...withDoses(RETURNING_TODAY), uploading: true };
      case 'loading':
        return { ...BASE, loading: true };
      case 'update-ask':
        return { ...BASE, ...withDoses(RETURNING_TODAY), doseUpdate: sheet({}) };
      case 'update-taken':
        return { ...BASE, ...withDoses(RETURNING_TODAY), doseUpdate: sheet({ choice: 'took', when: 'scheduled' }) };
      case 'update-other':
        return {
          ...BASE,
          ...withDoses(RETURNING_TODAY),
          doseUpdate: sheet({ choice: 'took', when: 'other', otherTime: new Date(localAt(0, '09:15')) }),
        };
      case 'update-skipped':
        return { ...BASE, ...withDoses(RETURNING_TODAY), doseUpdate: sheet({ choice: 'skipped', reason: 'FELT_UNWELL' }) };
      case 'update-missed':
        return { ...BASE, ...withDoses(RETURNING_TODAY), doseUpdate: sheet({ choice: 'missed' }) };
      case 'update-saving':
        return { ...BASE, ...withDoses(RETURNING_TODAY), actionHangs: true, doseUpdate: sheet({ choice: 'missed' }) };
      case 'update-failed':
        return { ...BASE, ...withDoses(RETURNING_TODAY), actionFails: true, doseUpdate: sheet({ choice: 'missed' }) };
      case 'update-offline':
        return { ...BASE, ...withDoses(RETURNING_TODAY), offline: true, doseUpdate: sheet({ choice: 'took' }) };
      case 'nothingDue':
        return { ...BASE, ...withDoses([]) };
      case 'dueNow':
        return { ...BASE, ...withDoses(DUE_NOW_TODAY) };
      case 'manyDue':
        return { ...BASE, ...withDoses(MANY_DUE_TODAY) };
      case 'allDone':
        return { ...BASE, ...withDoses(ALL_DONE_TODAY) };
      case 'allDone-uploading':
        return { ...BASE, ...withDoses(ALL_DONE_TODAY), uploading: true };
      case 'error':
        return { ...BASE, apiFails: true };
      case 'offline':
        return { ...BASE, ...withDoses(DUE_NOW_TODAY), offline: true };
      case 'newUser':
      default:
        return BASE;
    }
  }
  if (screen === 'medicines') {
    if (state === 'empty') return BASE;
    return {
      ...BASE,
      medications: ALL_MEDICINES,
      doses: [...recentDays(SIX_ACTIVE), ...MANY_DUE_TODAY, ...comingDays(SIX_ACTIVE)],
    };
  }
  if (screen === 'records') {
    // Records reads the timeline and the report counts; the medicines feed the date strip.
    return { ...BASE, medications: ALL_MEDICINES, doses: [...recentDays(SIX_ACTIVE), ...DUE_NOW_TODAY] };
  }
  return { ...BASE, medications: ALL_MEDICINES, doses: [...DUE_NOW_TODAY] };
}
