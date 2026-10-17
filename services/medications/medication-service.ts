import { z } from 'zod';
import { ApiClient, api } from '../api/client';
import {
  DiscreteOccurrenceScheduler,
  MedicationScheduleOccurrence,
  NotificationPayload,
  SupportedPlatform,
} from '../notifications/actual-count-scheduler';

export const MedicationStatusSchema = z.enum([
  'INACTIVE',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'DISCONTINUED',
]);

export type MedicationStatus = z.infer<typeof MedicationStatusSchema>;

export const DoseStatusSchema = z.enum(['PENDING', 'TAKEN', 'SKIPPED', 'SNOOZED']);

export type DoseStatus = z.infer<typeof DoseStatusSchema>;

export const MedicationRecordSchema = z.object({
  id: z.string(),
  patientProfileId: z.string(),
  nameAsWritten: z.string(),
  normalizedMedicineName: z.string().nullable().optional(),
  strength: z.string().nullable().optional(),
  dosageForm: z.string(),
  route: z.string(),
  prescribedInstructions: z.string().nullable().optional(),
  status: MedicationStatusSchema,
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  reminderTimes: z.array(z.string()).nullable().optional(),
  discontinuedReason: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  discontinuedAt: z.string().nullable().optional(),
  prescriptionItemId: z.string().nullable().optional(),
  prescriptionId: z.string().nullable().optional(),
  sourceDocumentId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MedicationRecord = z.infer<typeof MedicationRecordSchema>;

export const DoseLogSchema = z.object({
  id: z.string(),
  medicationId: z.string(),
  patientProfileId: z.string(),
  scheduledTime: z.string(),
  status: DoseStatusSchema,
  actionTime: z.string().nullable().optional(),
  snoozeMinutes: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DoseLog = z.infer<typeof DoseLogSchema>;

export const MedicationDetailSchema = MedicationRecordSchema.extend({
  prescription: z
    .object({
      id: z.string(),
      prescriptionDate: z.string().nullable().optional(),
      doctorName: z.string().nullable().optional(),
      clinicHospitalName: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  sourceDocument: z
    .object({
      id: z.string(),
      originalFilename: z.string(),
      mimeType: z.string(),
    })
    .nullable()
    .optional(),
  doseLogs: z.array(DoseLogSchema),
});

export type MedicationDetail = z.infer<typeof MedicationDetailSchema>;

export const DocumentSignedUrlSchema = z.object({
  data: z.object({
    signedUrl: z.string(),
    expiresInSeconds: z.number(),
    filename: z.string(),
    mimeType: z.string(),
  }),
});

export type DocumentSignedUrl = z.infer<typeof DocumentSignedUrlSchema>['data'];

export class MedicationService {
  constructor(private readonly client: ApiClient = api) {}

  /**
   * List medications for the authenticated patient, optionally filtered by status.
   */
  async listMedications(status?: MedicationStatus): Promise<MedicationRecord[]> {
    const query = status ? `?status=${status}` : '';
    const res = await this.client.get<{ data: MedicationRecord[] }>(
      `/medications${query}`,
      z.object({ data: z.array(MedicationRecordSchema) })
    );
    return res.data;
  }

  /**
   * Manually creates a new medication record with optional reminder schedule.
   */
  async createMedication(input: {
    nameAsWritten: string;
    dosageForm: string;
    strength?: string;
    route?: string;
    prescribedInstructions?: string;
    reminderTimes?: string[];
    startDate?: string;
    endDate?: string;
    notes?: string;
  }): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message?: string }>(
      '/medications',
      input,
      z.object({ data: MedicationRecordSchema, message: z.string().optional() })
    );
    return res.data;
  }

  /**
   * Retrieves full details, provenance, and dose history for a medication.
   */
  async getMedicationDetails(id: string): Promise<MedicationDetail> {
    const res = await this.client.get<{ data: MedicationDetail }>(
      `/medications/${id}`,
      z.object({ data: MedicationDetailSchema })
    );
    return res.data;
  }

  /**
   * Retrieves secure signed URL for the source prescription document.
   */
  async getDocumentSignedUrl(id: string): Promise<DocumentSignedUrl> {
    const res = await this.client.get<{ data: DocumentSignedUrl }>(
      `/medications/${id}/document-url`,
      DocumentSignedUrlSchema
    );
    return res.data;
  }

  /**
   * Activates an eligible medication with explicit reminder times.
   */
  async activateMedication(
    id: string,
    schedule: { reminderTimes: string[]; startDate?: string; endDate?: string }
  ): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/activate`,
      schedule,
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Updates patient-selected reminder schedule preferences.
   */
  async updateReminderPreferences(
    id: string,
    schedule: { reminderTimes: string[]; startDate?: string; endDate?: string }
  ): Promise<MedicationRecord> {
    const res = await this.client.patch<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/schedule`,
      schedule,
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Pauses an active medication.
   */
  async pauseMedication(id: string): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/pause`,
      {},
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Resumes a paused medication.
   */
  async resumeMedication(id: string): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/resume`,
      {},
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Marks a medication as completed.
   */
  async completeMedication(id: string): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/complete`,
      {},
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Discontinues a medication with optional patient-reported reason.
   */
  async discontinueMedication(id: string, reason?: string): Promise<MedicationRecord> {
    const res = await this.client.post<{ data: MedicationRecord; message: string }>(
      `/medications/${id}/discontinue`,
      { reason },
      z.object({ data: MedicationRecordSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Retrieves scheduled dose occurrences in a time window.
   */
  async getDoseOccurrences(from?: string, to?: string): Promise<DoseLog[]> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await this.client.get<{ data: DoseLog[] }>(
      `/medications/doses${query}`,
      z.object({ data: z.array(DoseLogSchema) })
    );
    return res.data;
  }

  /**
   * Records explicit patient-reported action (TAKEN, SKIPPED, SNOOZED).
   */
  async recordDoseAction(
    doseId: string,
    payload: {
      action: 'TAKEN' | 'SKIPPED' | 'SNOOZED';
      notes?: string;
      snoozeMinutes?: number;
      actionTime?: string;
    }
  ): Promise<DoseLog> {
    const res = await this.client.post<{ data: DoseLog; message: string }>(
      `/medications/doses/${doseId}/action`,
      payload,
      z.object({ data: DoseLogSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Corrects a previously recorded dose action.
   */
  async correctDoseAction(
    doseId: string,
    payload: {
      action: 'TAKEN' | 'SKIPPED' | 'PENDING';
      notes?: string;
    }
  ): Promise<DoseLog> {
    const res = await this.client.patch<{ data: DoseLog; message: string }>(
      `/medications/doses/${doseId}/action`,
      payload,
      z.object({ data: DoseLogSchema, message: z.string() })
    );
    return res.data;
  }

  /**
   * Projects and formats discrete local notifications respecting platform caps (ADR-006).
   * Maps active DoseLogs to generic privacy-preserving payloads.
   */
  projectLocalNotifications(
    pendingDoses: DoseLog[],
    medicationsMap: Map<string, MedicationRecord>,
    platform: SupportedPlatform = 'ios',
    now: Date = new Date()
  ): NotificationPayload[] {
    const scheduler = new DiscreteOccurrenceScheduler(platform);

    const occurrences: MedicationScheduleOccurrence[] = pendingDoses
      .filter((dl) => dl.status === 'PENDING')
      .map((dl) => {
        const med = medicationsMap.get(dl.medicationId);
        return {
          scheduleId: dl.id,
          medicationName: med?.nameAsWritten || 'Medication',
          dosage: med?.strength || '',
          scheduledTime: new Date(dl.scheduledTime),
        };
      });

    const schedulable = scheduler.projectSchedulableOccurrences(occurrences, now);
    return scheduler.formatNotificationPayloads(schedulable);
  }
}

export const medicationService = new MedicationService();
