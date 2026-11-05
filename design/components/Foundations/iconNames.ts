import type { StatusIcon } from '../../status';
import { color, size, textToneColor } from '../../tokens';
import type { TextTone, ToneName } from '../../tokens';

// Medicine forms use monochrome shape glyphs (Material Community Icons), never
// colored pill pictures. Rendered by MedicineIcon, not Icon.
export const medicineFormIcon = {
  tablet: 'minus-circle-outline',
  capsule: 'pill',
  liquid: 'bottle-tonic-outline',
  injection: 'needle',
  inhaler: 'spray',
  drops: 'eyedropper',
  topical: 'lotion-outline',
  other: 'medical-bag',
} as const;

export type MedicineForm = keyof typeof medicineFormIcon;

type UiIcon =
  | 'checkmark'
  // Filled glyphs for category tiles.
  | 'heart'
  | 'pulse'
  | 'flask'
  | 'calendar'
  | 'time'
  | 'person'
  | 'scan'
  | 'water'
  | 'fitness'
  | 'bandage'
  | 'shield-checkmark'
  | 'document-attach'
  | 'alarm'
  | 'add-circle'
  | 'notifications'
  | 'cloud-done-outline'
  | 'sync-outline'
  | 'git-compare-outline'
  | 'camera-outline'
  | 'folder-open-outline'
  | 'chevron-down'
  | 'chevron-up'
  | 'ellipsis-horizontal'
  | 'funnel-outline'
  | 'document-text'
  | 'medkit'
  | 'clipboard'
  | 'person-circle'
  | 'chevron-forward'
  | 'chevron-back'
  | 'close'
  | 'search'
  | 'eye-outline'
  | 'eye-off-outline'
  | 'mail-outline'
  | 'lock-closed-outline'
  | 'person-outline'
  | 'notifications-outline'
  | 'add'
  | 'scan-outline'
  | 'calendar-outline'
  | 'key-outline'
  | 'refresh'
  | 'cloud-offline-outline'
  | 'warning-outline'
  | 'information-circle-outline'
  | 'home'
  | 'home-outline'
  | 'document-text-outline'
  | 'medkit-outline'
  | 'clipboard-outline'
  | 'person-circle-outline';

export type IconName = StatusIcon | UiIcon;

export const iconSize = {
  sm: size.iconSm,
  md: size.iconMd,
  lg: size.iconLg,
} as const;

// Text tones are checked first, so 'danger' resolves to action.danger.
// Its value matches tone.danger.fg, so the two sources agree.
export function resolveIconColor(tone: TextTone | ToneName): string {
  if (Object.prototype.hasOwnProperty.call(textToneColor, tone)) {
    return textToneColor[tone as TextTone];
  }
  return color.tone[tone as ToneName].fg;
}
