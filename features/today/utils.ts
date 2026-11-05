import { MedicationRecord } from '../../services/medications/medication-service';

export function formatTimeDifference(mins: number): string {
    if (mins < 0) {
      const absMins = Math.abs(mins);
      if (absMins < 60) return `${absMins}m ago`;
      const hrs = Math.floor(absMins / 60);
      const rem = absMins % 60;
      return rem > 0 ? `${hrs}h ${rem}m ago` : `${hrs}h ago`;
    } else {
      if (mins < 60) return `in ${mins}m`;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
    }
}

export function buildMedicationRecord(
  m: any,
  reviewPayload: any,
  patientProfileId: string | undefined
): MedicationRecord {
          const isAsNeeded =
            m.frequency_text?.toLowerCase().includes('as needed') ||
            m.frequency_text?.toLowerCase().includes('sos') ||
            m.instructions?.toLowerCase().includes('as needed') ||
            m.instructions?.toLowerCase().includes('sos') ||
            (Array.isArray(m.reminder_times) && m.reminder_times.length === 0 && m.times_per_day === 0);

          const reminderTimes = isAsNeeded
            ? []
            : Array.isArray(m.reminder_times) && m.reminder_times.length > 0
            ? m.reminder_times
            : ['08:00'];

          const newMed: MedicationRecord = {
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            patientProfileId: patientProfileId || 'patient-local',
            nameAsWritten: m.name_as_written,
            normalizedMedicineName: m.normalized_medicine_name || m.name_as_written,
            strength: m.strength || '',
            dosageForm: m.dosage_form || 'TABLET',
            route: m.route || 'ORAL',
            prescribedInstructions:
              m.instructions ||
              m.frequency_text ||
              (isAsNeeded ? 'Take as needed (SOS)' : 'Take as prescribed'),
            status: 'ACTIVE',
            startDate: reviewPayload.prescription_date || new Date().toISOString(),
            reminderTimes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

  return newMed;
}
