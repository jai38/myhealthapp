import { MedicationRecord } from '../../services/medications/medication-service';

const nonEmpty = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null;

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Phone-side copy of a confirmed medicine, shown until the next server sync.
 * It never invents a value (CLAUDE.md rules 12 and 13): a missing form, route,
 * instruction or start date stays empty/null so the UI can say "not given", and
 * `normalizedMedicineName` stays null until the server supplies it. Reminder
 * times come only from the prescription, so a medicine without them gets none.
 * When the server's own confirmed record is passed, its values win.
 */
export function buildMedicationRecord(
  m: any,
  reviewPayload: any,
  patientProfileId: string | undefined,
  serverMedicine?: Partial<MedicationRecord> | null
): MedicationRecord {
  const now = new Date().toISOString();
  const fromPrescription: string[] = Array.isArray(m.reminder_times)
    ? m.reminder_times.filter((x: unknown): x is string => typeof x === 'string' && HH_MM.test(x))
    : [];
  const server = serverMedicine ?? {};

  return {
    id: server.id ?? `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    patientProfileId: server.patientProfileId ?? patientProfileId ?? '',
    nameAsWritten: server.nameAsWritten ?? m.name_as_written,
    normalizedMedicineName: server.normalizedMedicineName ?? nonEmpty(m.normalized_medicine_name),
    strength: server.strength ?? nonEmpty(m.strength) ?? '',
    dosageForm: server.dosageForm ?? nonEmpty(m.dosage_form) ?? '',
    route: server.route ?? nonEmpty(m.route) ?? '',
    prescribedInstructions:
      server.prescribedInstructions ?? nonEmpty(m.instructions) ?? nonEmpty(m.frequency_text),
    status: 'ACTIVE',
    startDate: server.startDate ?? nonEmpty(reviewPayload?.prescription_date),
    reminderTimes: server.reminderTimes ?? fromPrescription,
    createdAt: server.createdAt ?? now,
    updatedAt: server.updatedAt ?? now,
  };
}
