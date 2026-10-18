import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicationRecord, DoseLog, medicationService } from './medication-service';
import { authService } from '../auth/auth-service';
import { scheduleSnoozeReminder } from '../notifications/notification-service';

const STORAGE_KEYS = {
  MEDS: '@myhealthapp/persisted_meds',
  DOSES: '@myhealthapp/persisted_doses',
  INITIALIZED: '@myhealthapp/store_initialized_v2',
} as const;

// In-memory fallback for environments without AsyncStorage
const memoryStore = new Map<string, string>();

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const v = await AsyncStorage.getItem(key);
      if (v !== null && v !== undefined) return v;
    } catch {
      // ignore
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const v = localStorage.getItem(key);
        if (v !== null && v !== undefined) return v;
      } catch {
        // ignore
      }
    }
    return memoryStore.get(key) || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },
};

export const INITIAL_PRESCRIBED_MEDS: MedicationRecord[] = [
  {
    id: 'med-metformin-1',
    patientProfileId: 'patient-local',
    nameAsWritten: 'Metformin 500mg',
    normalizedMedicineName: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosageForm: 'Oral Tablet',
    route: 'Oral',
    prescribedInstructions: 'Take 1 tablet every morning with breakfast.',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    reminderTimes: ['08:00'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-atorvastatin-2',
    patientProfileId: 'patient-local',
    nameAsWritten: 'Atorvastatin 20mg',
    normalizedMedicineName: 'Atorvastatin Calcium',
    strength: '20 mg',
    dosageForm: 'Oral Tablet',
    route: 'Oral',
    prescribedInstructions: 'Take 1 tablet in the afternoon after lunch.',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    reminderTimes: ['13:00'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-lisinopril-3',
    patientProfileId: 'patient-local',
    nameAsWritten: 'Lisinopril 10mg',
    normalizedMedicineName: 'Lisinopril',
    strength: '10 mg',
    dosageForm: 'Oral Tablet',
    route: 'Oral',
    prescribedInstructions: 'Take 1 tablet in the evening before sleep.',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    reminderTimes: ['20:00'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateWeekDoses(meds: MedicationRecord[]): DoseLog[] {
  const doses: DoseLog[] = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const todayDateStr = toLocalDateString(today);

  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + d);
    const dateStr = toLocalDateString(dayDate);
    const isPast = dateStr < todayDateStr;
    const isToday = dateStr === todayDateStr;

    for (const med of meds) {
      if (!med.reminderTimes) continue;
      for (const timeStr of med.reminderTimes) {
        const timeClean = timeStr.trim();
        const [hh, mm] = timeClean.split(':').map(Number);
        const schedTime = `${dateStr}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;

        let status: DoseLog['status'] = 'PENDING';
        let actionTime: string | undefined = undefined;

        if (isPast) {
          status = 'TAKEN';
          actionTime = `${dateStr}T${String(hh).padStart(2, '0')}:${String(mm + 5).padStart(2, '0')}:00`;
        } else {
          status = 'PENDING';
        }

        doses.push({
          id: `dose-${med.id}-${dateStr}-${timeClean.replace(':', '')}`,
          medicationId: med.id,
          patientProfileId: med.patientProfileId,
          scheduledTime: schedTime,
          status,
          actionTime,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return doses;
}

type StoreListener = () => void;

class MedicationStore {
  private meds: MedicationRecord[] = [...INITIAL_PRESCRIBED_MEDS];
  private doses: DoseLog[] = generateWeekDoses(INITIAL_PRESCRIBED_MEDS);
  private initialized = false;
  private listeners = new Set<StoreListener>();

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedMeds = await safeStorage.getItem(STORAGE_KEYS.MEDS);
      const storedDoses = await safeStorage.getItem(STORAGE_KEYS.DOSES);

      if (storedMeds && storedDoses) {
        const parsedMeds = JSON.parse(storedMeds);
        const parsedDoses = JSON.parse(storedDoses);
        if (Array.isArray(parsedMeds) && parsedMeds.length > 0) {
          this.meds = parsedMeds;
        }
        if (Array.isArray(parsedDoses) && parsedDoses.length > 0) {
          this.doses = parsedDoses;
        }
      } else {
        this.meds = [...INITIAL_PRESCRIBED_MEDS];
        this.doses = generateWeekDoses(this.meds);
        await this.persist();
      }
    } catch {
      this.meds = [...INITIAL_PRESCRIBED_MEDS];
      this.doses = generateWeekDoses(this.meds);
    } finally {
      this.initialized = true;
      this.notify();
    }
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) {
      try {
        l();
      } catch {
        // ignore listener errors
      }
    }
  }

  private async persist(): Promise<void> {
    try {
      await safeStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(this.meds));
      await safeStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(this.doses));
    } catch {
      // ignore
    }
    this.notify();
  }

  getMedications(): MedicationRecord[] {
    return this.meds.length > 0 ? this.meds : INITIAL_PRESCRIBED_MEDS;
  }

  getMedicationById(id: string): MedicationRecord | undefined {
    return this.meds.find((m) => m.id === id) || INITIAL_PRESCRIBED_MEDS.find((m) => m.id === id);
  }

  getAllDoses(): DoseLog[] {
    return this.doses;
  }

  getDosesForDate(dateString: string): DoseLog[] {
    return this.doses
      .filter((d) => {
        if (d.scheduledTime.startsWith(dateString)) return true;
        try {
          const local = toLocalDateString(new Date(d.scheduledTime));
          return local === dateString;
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }

  getTodayDoses(): DoseLog[] {
    const todayStr = toLocalDateString(new Date());
    return this.getDosesForDate(todayStr);
  }

  /**
   * Optimistically records Taken, Snoozed, or Skipped.
   * Persists immediately to local storage and syncs to backend if available.
   */
  async recordAction(
    doseId: string,
    action: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
    snoozeMinutes: number = 15
  ): Promise<DoseLog> {
    const targetIdx = this.doses.findIndex((d) => d.id === doseId);
    const nowIso = new Date().toISOString();

    if (targetIdx >= 0) {
      const existing = this.doses[targetIdx];
      const updated: DoseLog = {
        ...existing,
        status: action,
        actionTime: action === 'TAKEN' ? nowIso : existing.actionTime,
        snoozeMinutes: action === 'SNOOZED' ? snoozeMinutes : existing.snoozeMinutes,
        updatedAt: nowIso,
      };

      this.doses = [
        ...this.doses.slice(0, targetIdx),
        updated,
        ...this.doses.slice(targetIdx + 1),
      ];

      await this.persist();

      // Schedule local device notification if snoozed
      if (action === 'SNOOZED') {
        const med = this.meds.find((m) => m.id === existing.medicationId);
        if (med) {
          scheduleSnoozeReminder(med.id, med.nameAsWritten, snoozeMinutes).catch(() => {});
        }
      }

      // Background sync to backend if online and authenticated
      if (authService.isAuthenticated()) {
        medicationService
          .recordDoseAction(doseId, {
            action,
            snoozeMinutes,
            actionTime: nowIso,
          })
          .catch(() => {
            // Safe fallback: keeps optimistic local state
          });
      }

      return updated;
    }

    throw new Error(`Dose ${doseId} not found`);
  }

  /**
   * Calculates adherence percentage for a specific date (or today).
   */
  getAdherenceForDate(dateString: string): {
    percentage: number;
    taken: number;
    total: number;
  } {
    const dayDoses = this.getDosesForDate(dateString);
    const total = dayDoses.length;
    const taken = dayDoses.filter((d) => d.status === 'TAKEN').length;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 100;
    return { percentage, taken, total };
  }

  /**
   * Synchronizes server-loaded medications into the store.
   */
  async syncFromServer(serverMeds: MedicationRecord[], serverDoses: DoseLog[]): Promise<void> {
    if (serverMeds.length > 0) {
      this.meds = serverMeds;
    }
    if (serverDoses.length > 0) {
      this.doses = serverDoses;
    }
    await this.persist();
  }

  /**
   * Adds a new medication and schedules its doses.
   */
  async addMedication(med: MedicationRecord): Promise<void> {
    this.meds = [med, ...this.meds];
    const newDoses = generateWeekDoses([med]);
    this.doses = [...this.doses, ...newDoses];
    await this.persist();
  }
}

export const medicationStore = new MedicationStore();
