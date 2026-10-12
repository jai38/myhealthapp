import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MedicationService,
  MedicationRecord,
  DoseLog,
  MedicationDetail,
} from '../services/medications/medication-service';
import { ApiClient } from '../services/api/client';
import { PLATFORM_LIMITS } from '../services/notifications/actual-count-scheduler';

describe('Phase 4 Mobile: Medication Management, Safety Rules & Notification Scheduling', () => {
  let mockClient: ApiClient;
  let medicationService: MedicationService;

  const sampleMedication: MedicationRecord = {
    id: 'med-1',
    patientProfileId: 'pat-1',
    nameAsWritten: 'Tab Telmisartan 40mg',
    normalizedMedicineName: 'Telmisartan',
    strength: '40mg',
    dosageForm: 'TABLET',
    route: 'ORAL',
    prescribedInstructions: '1 tablet once daily morning after food',
    status: 'ACTIVE',
    startDate: '2026-03-15',
    endDate: '2026-06-15',
    reminderTimes: ['08:00'],
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  };

  const sampleInactiveMedication: MedicationRecord = {
    id: 'med-2',
    patientProfileId: 'pat-1',
    nameAsWritten: 'Cap Amoxicillin 500mg',
    normalizedMedicineName: 'Amoxicillin',
    strength: '500mg',
    dosageForm: 'CAPSULE',
    route: 'ORAL',
    prescribedInstructions: '1 capsule three times daily for 5 days',
    status: 'INACTIVE', // Confirmed from prescription, but NOT yet activated
    startDate: '2026-03-15',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  };

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://mock-api.test' });
    medicationService = new MedicationService(mockClient);
  });

  describe('Clinical Safety Rules & Medication Separation', () => {
    it('RULE A & 4A: Separates active, inactive, and past medications', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValueOnce({
        data: [sampleMedication, sampleInactiveMedication],
      });

      const meds = await medicationService.listMedications();
      expect(meds.length).toBe(2);

      const active = meds.filter((m) => m.status === 'ACTIVE');
      const inactive = meds.filter((m) => m.status === 'INACTIVE');

      expect(active.length).toBe(1);
      expect(active[0].nameAsWritten).toBe('Tab Telmisartan 40mg');

      expect(inactive.length).toBe(1);
      expect(inactive[0].nameAsWritten).toBe('Cap Amoxicillin 500mg');
    });

    it('RULE B & 5: Requires patient-selected reminder preferences to activate', async () => {
      const postSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: {
          ...sampleInactiveMedication,
          status: 'ACTIVE',
          reminderTimes: ['08:00', '14:00', '20:00'],
        },
        message: 'Medication activated successfully',
      });

      const activated = await medicationService.activateMedication('med-2', {
        reminderTimes: ['08:00', '14:00', '20:00'],
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/medications/med-2/activate',
        { reminderTimes: ['08:00', '14:00', '20:00'] },
        expect.anything()
      );
      expect(activated.status).toBe('ACTIVE');
      expect(activated.reminderTimes).toEqual(['08:00', '14:00', '20:00']);
    });

    it('RULE C: Medication lifecycle transitions (pause, resume, complete, discontinue)', async () => {
      // Pause
      const pauseSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: { ...sampleMedication, status: 'PAUSED' },
        message: 'Medication paused',
      });
      const paused = await medicationService.pauseMedication('med-1');
      expect(pauseSpy).toHaveBeenCalledWith('/medications/med-1/pause', {}, expect.anything());
      expect(paused.status).toBe('PAUSED');

      // Resume
      const resumeSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: { ...sampleMedication, status: 'ACTIVE' },
        message: 'Medication resumed',
      });
      const resumed = await medicationService.resumeMedication('med-1');
      expect(resumeSpy).toHaveBeenCalledWith('/medications/med-1/resume', {}, expect.anything());
      expect(resumed.status).toBe('ACTIVE');

      // Complete
      const completeSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: { ...sampleMedication, status: 'COMPLETED' },
        message: 'Medication marked as completed',
      });
      const completed = await medicationService.completeMedication('med-1');
      expect(completeSpy).toHaveBeenCalledWith('/medications/med-1/complete', {}, expect.anything());
      expect(completed.status).toBe('COMPLETED');

      // Discontinue
      const discSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: {
          ...sampleMedication,
          status: 'DISCONTINUED',
          discontinuedReason: 'Adverse side effects reported',
        },
        message: 'Medication discontinued',
      });
      const discontinued = await medicationService.discontinueMedication('med-1', 'Adverse side effects reported');
      expect(discSpy).toHaveBeenCalledWith(
        '/medications/med-1/discontinue',
        { reason: 'Adverse side effects reported' },
        expect.anything()
      );
      expect(discontinued.status).toBe('DISCONTINUED');
      expect(discontinued.discontinuedReason).toBe('Adverse side effects reported');
    });
  });

  describe('Dose Tracking & Patient-Reported Actions', () => {
    it('RULE D & 7: Records explicit patient dose actions (TAKEN, SKIPPED, SNOOZED)', async () => {
      const sampleDose: DoseLog = {
        id: 'dose-1',
        medicationId: 'med-1',
        patientProfileId: 'pat-1',
        scheduledTime: '2026-10-12T08:00:00Z',
        status: 'PENDING',
        createdAt: '2026-10-12T00:00:00Z',
        updatedAt: '2026-10-12T00:00:00Z',
      };

      const postSpy = vi.spyOn(mockClient, 'post').mockResolvedValueOnce({
        data: {
          ...sampleDose,
          status: 'TAKEN',
          actionTime: '2026-10-12T08:05:00Z',
        },
        message: 'Dose recorded as TAKEN',
      });

      const result = await medicationService.recordDoseAction('dose-1', {
        action: 'TAKEN',
        actionTime: '2026-10-12T08:05:00Z',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/medications/doses/dose-1/action',
        { action: 'TAKEN', actionTime: '2026-10-12T08:05:00Z' },
        expect.anything()
      );
      expect(result.status).toBe('TAKEN');
      expect(result.actionTime).toBe('2026-10-12T08:05:00Z');
    });

    it('Allows correction of accidental dose actions', async () => {
      const sampleDose: DoseLog = {
        id: 'dose-2',
        medicationId: 'med-1',
        patientProfileId: 'pat-1',
        scheduledTime: '2026-10-12T08:00:00Z',
        status: 'SKIPPED',
        createdAt: '2026-10-12T00:00:00Z',
        updatedAt: '2026-10-12T08:05:00Z',
      };

      const patchSpy = vi.spyOn(mockClient, 'patch').mockResolvedValueOnce({
        data: { ...sampleDose, status: 'TAKEN', notes: 'Correction: dose was taken' },
        message: 'Dose action corrected',
      });

      const corrected = await medicationService.correctDoseAction('dose-2', {
        action: 'TAKEN',
        notes: 'Correction: dose was taken',
      });

      expect(patchSpy).toHaveBeenCalledWith(
        '/medications/doses/dose-2/action',
        { action: 'TAKEN', notes: 'Correction: dose was taken' },
        expect.anything()
      );
      expect(corrected.status).toBe('TAKEN');
    });
  });

  describe('Local Notification Projection & Safety Caps (ADR-006)', () => {
    it('RULE 6: Maps pending doses to privacy-preserving notifications without leaking drug names on lock screen', () => {
      const now = new Date('2026-10-12T07:00:00Z');
      const doses: DoseLog[] = [
        {
          id: 'dl-1',
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: '2026-10-12T08:00:00Z',
          status: 'PENDING',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        },
        {
          id: 'dl-2',
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: '2026-10-12T20:00:00Z',
          status: 'PENDING',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        },
      ];

      const medMap = new Map<string, MedicationRecord>();
      medMap.set('med-1', sampleMedication);

      const notifs = medicationService.projectLocalNotifications(doses, medMap, 'ios', now);
      expect(notifs.length).toBe(2);

      // Verify privacy on lock screen
      for (const n of notifs) {
        expect(n.title).toBe('Medication Reminder');
        expect(n.body).toBe('It is time for your scheduled medication.');
        // Lock screen text must NOT contain drug name or dosage for PHI privacy
        expect(n.body).not.toContain('Telmisartan');
        expect(n.body).not.toContain('40mg');
      }
    });

    it('RULE 6: Enforces strict platform notification limits (iOS 60 cap / Android 100 cap)', () => {
      const now = new Date('2026-10-12T07:00:00Z');
      // Create 80 upcoming pending doses
      const doses: DoseLog[] = [];
      for (let i = 1; i <= 80; i++) {
        doses.push({
          id: `dl-${i}`,
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: new Date(now.getTime() + i * 3600 * 1000).toISOString(),
          status: 'PENDING',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        });
      }

      const medMap = new Map<string, MedicationRecord>();
      medMap.set('med-1', sampleMedication);

      // iOS test: capped at 60
      const iosNotifs = medicationService.projectLocalNotifications(doses, medMap, 'ios', now);
      expect(iosNotifs.length).toBe(PLATFORM_LIMITS.ios.maxScheduledNotifications);
      expect(iosNotifs.length).toBe(60);

      // Android test: allows up to 100, so all 80 fit
      const androidNotifs = medicationService.projectLocalNotifications(doses, medMap, 'android', now);
      expect(androidNotifs.length).toBe(80);
    });

    it('RULE 6 & 7: Excludes past or already taken doses from future notifications', () => {
      const now = new Date('2026-10-12T12:00:00Z');
      const doses: DoseLog[] = [
        {
          id: 'dl-past',
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: '2026-10-12T08:00:00Z', // In the past
          status: 'PENDING',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        },
        {
          id: 'dl-taken',
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: '2026-10-12T14:00:00Z', // Future, but already marked TAKEN
          status: 'TAKEN',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        },
        {
          id: 'dl-future',
          medicationId: 'med-1',
          patientProfileId: 'pat-1',
          scheduledTime: '2026-10-12T20:00:00Z', // Future, PENDING
          status: 'PENDING',
          createdAt: '2026-10-12T00:00:00Z',
          updatedAt: '2026-10-12T00:00:00Z',
        },
      ];

      const medMap = new Map<string, MedicationRecord>();
      medMap.set('med-1', sampleMedication);

      const notifs = medicationService.projectLocalNotifications(doses, medMap, 'ios', now);
      // Only the future PENDING dose should be scheduled
      expect(notifs.length).toBe(1);
      expect(notifs[0].scheduleId).toBe('dl-future');
    });
  });
});
