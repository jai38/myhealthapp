// Display-only mappings for the medication detail screen. No state or clinical rules live here.
import type { StatusDisplay } from '../../../design/status';
import type { StringKey } from '../../../design/strings';
import type { MedicationStatus } from '../../../services/medications/medication-service';
import { FREQUENCY_PRESETS, QUICK_TIME_PRESETS } from '../reminder-time-utils';

// Medication (regimen) status pill. Not a dose status, so it does not use doseStatusDisplay.
export const MEDICATION_STATUS_DISPLAY: Record<MedicationStatus, StatusDisplay> = {
  ACTIVE: {
    labelKey: 'medicines.detail.status.active',
    tone: 'success',
    variant: 'soft',
    icon: 'checkmark-circle',
  },
  INACTIVE: {
    labelKey: 'medicines.detail.status.inactive',
    tone: 'caution',
    variant: 'soft',
    icon: 'help-circle-outline',
  },
  PAUSED: {
    labelKey: 'medicines.detail.status.paused',
    tone: 'caution',
    variant: 'soft',
    icon: 'remove-circle-outline',
  },
  COMPLETED: {
    labelKey: 'medicines.detail.status.completed',
    tone: 'neutral',
    variant: 'soft',
    icon: 'checkmark-circle',
  },
  DISCONTINUED: {
    labelKey: 'medicines.detail.status.discontinued',
    tone: 'neutral',
    variant: 'soft',
    icon: 'remove-circle-outline',
  },
};

// Keyed by the preset labels in reminder-time-utils, so a renamed preset fails typecheck here.
export const FREQUENCY_LABEL_KEYS: Record<(typeof FREQUENCY_PRESETS)[number]['label'], StringKey> = {
  'Once daily': 'medicines.detail.freq.once',
  'Twice daily': 'medicines.detail.freq.twice',
  '3x daily': 'medicines.detail.freq.thrice',
  '4x daily': 'medicines.detail.freq.four',
};

export const QUICK_LABEL_KEYS: Record<(typeof QUICK_TIME_PRESETS)[number]['label'], StringKey> = {
  Morning: 'medicines.detail.quick.morning',
  'Lunch / Noon': 'medicines.detail.quick.noon',
  Evening: 'medicines.detail.quick.evening',
  Bedtime: 'medicines.detail.quick.bedtime',
};
