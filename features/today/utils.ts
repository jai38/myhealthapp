import { DoseLog, MedicationRecord } from '../../services/medications/medication-service';

export type DoseTemporalState = 'OVERDUE' | 'DUE_NOW' | 'SNOOZED' | 'UPCOMING';

export function formatTimeDifference(mins: number): string {
    if (mins < 0) {
      const absMins = Math.abs(mins);
      if (absMins < 60) return `${absMins}m overdue`;
      const hrs = Math.floor(absMins / 60);
      const rem = absMins % 60;
      return rem > 0 ? `${hrs}h ${rem}m overdue` : `${hrs}h overdue`;
    } else {
      if (mins < 60) return `in ${mins}m`;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
    }
}

export function getSpotlightDose(
  actionableDoses: DoseLog[],
  isSelectedDateToday: boolean,
  nowMs: number
): { spotlightDose: DoseLog | null; doseTemporalState: DoseTemporalState; diffMinutes: number } {
  let spotlightDose: DoseLog | null = null;
  let doseTemporalState: DoseTemporalState = 'UPCOMING';
  let diffMinutes = 0;

  if (actionableDoses.length > 0) {
    if (isSelectedDateToday) {
      // Prioritization for Today:
      // 1. Due Now: Scheduled time has arrived, within past 15 mins (diff <= 0 && diff >= -15)
      const dueNow = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff <= 0 && diff >= -15;
      });
      // 2. Active snoozed doses
      const snoozed = actionableDoses.find((d) => d.status === 'SNOOZED');
      // 3. Overdue doses: Scheduled time is more than 15 mins in the past (diff < -15)
      const overdue = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff < -15;
      });
      // 4. Earliest upcoming dose in the future (diff > 0)
      const upcoming = actionableDoses.find((d) => {
        const diff = Math.round((new Date(d.scheduledTime).getTime() - nowMs) / 60000);
        return diff > 0;
      });

      if (dueNow) {
        spotlightDose = dueNow;
        doseTemporalState = 'DUE_NOW';
        diffMinutes = Math.round((new Date(dueNow.scheduledTime).getTime() - nowMs) / 60000);
      } else if (snoozed) {
        spotlightDose = snoozed;
        doseTemporalState = 'SNOOZED';
        diffMinutes = Math.round((new Date(snoozed.scheduledTime).getTime() - nowMs) / 60000);
      } else if (overdue) {
        spotlightDose = overdue;
        doseTemporalState = 'OVERDUE';
        diffMinutes = Math.round((new Date(overdue.scheduledTime).getTime() - nowMs) / 60000);
      } else {
        spotlightDose = upcoming || actionableDoses[0];
        doseTemporalState = 'UPCOMING';
        diffMinutes = Math.round((new Date(spotlightDose.scheduledTime).getTime() - nowMs) / 60000);
      }
    } else {
      spotlightDose = actionableDoses[0];
      doseTemporalState = 'UPCOMING';
      diffMinutes = Math.round((new Date(spotlightDose.scheduledTime).getTime() - nowMs) / 60000);
    }
  }

  return { spotlightDose, doseTemporalState, diffMinutes };
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
