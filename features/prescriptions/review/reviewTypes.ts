export interface EditableMedicine {
  id: string;
  name_as_written: string;
  normalized_medicine_name?: string;
  strength?: string;
  dosage_form: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS' | 'INHALER' | 'OTHER';
  frequency_text?: string;
  duration_text?: string;
  route: 'ORAL' | 'TOPICAL' | 'INTRAVENOUS' | 'INHALATION' | 'OPHTHALMIC' | 'OTHER';
  instructions?: string;
  confidence: 'HIGH' | 'UNCERTAIN';
  is_active_medication: boolean;
  times_per_day?: number;
  reminder_times?: string[];
  total_count?: string;
}

// Preset values are data: they are saved as duration_text and frequency_text,
// so they stay exactly as written and are shown as their own labels.
export const DURATION_PRESETS = [
  '1 Day',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '1 Month',
  '3 Months',
  'Ongoing',
];

export const FREQUENCY_PRESETS = [
  { label: '1x Daily', times: ['08:00'] },
  { label: '2x Daily', times: ['08:00', '20:00'] },
  { label: '3x Daily', times: ['08:00', '13:00', '20:00'] },
  { label: '4x Daily', times: ['08:00', '12:00', '16:00', '20:00'] },
  { label: 'As Needed', times: [] as string[] },
];

// Quick reminder-time presets. Labels are looked up by the editor.
export const TIME_PRESET_VALUES = ['08:00', '13:00', '18:00', '21:00'] as const;

export const DEFAULT_REMINDER_TIME = '08:00';
