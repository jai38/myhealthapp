import type { ToneName } from './tokens';
import type { StringKey } from './strings';

/**
 * Dose display states. The caller decides the state; this module never
 * infers one from a clock or from notification activity.
 */
export type DoseDisplayState =
  | { kind: 'upcoming'; scheduledAt: Date }
  | { kind: 'dueNow' }
  | { kind: 'snoozed'; remindAt: Date }
  | { kind: 'taken'; takenAt: Date }
  | { kind: 'skipped' }
  | { kind: 'missedByUser' }
  | { kind: 'notConfirmed'; scheduledAt: Date }
  | { kind: 'pausedOrStopped' };

export type StatusIcon =
  | 'time-outline'
  | 'alarm-outline'
  | 'notifications-outline'
  | 'checkmark-circle'
  | 'remove-circle-outline'
  | 'ellipse-outline'
  | 'help-circle-outline'
  | 'alert-circle-outline'
  | 'document-text-outline'
  | 'person-outline'
  | 'medkit-outline'
  | 'sparkles-outline'
  | 'shield-checkmark-outline';

export interface StatusDisplay {
  labelKey: StringKey;
  labelParams?: Record<string, string>;
  tone: ToneName;
  variant: 'filled' | 'soft';
  icon: StatusIcon;
}

export function doseStatusDisplay(
  state: DoseDisplayState,
  formatTime: (d: Date) => string,
): StatusDisplay | null {
  switch (state.kind) {
    case 'upcoming':
      return {
        labelKey: 'status.upcoming',
        labelParams: { time: formatTime(state.scheduledAt) },
        tone: 'info',
        variant: 'soft',
        icon: 'time-outline',
      };
    case 'dueNow':
      return {
        labelKey: 'status.dueNow',
        tone: 'info',
        variant: 'filled',
        icon: 'alarm-outline',
      };
    case 'snoozed':
      return {
        labelKey: 'status.snoozed',
        labelParams: { time: formatTime(state.remindAt) },
        tone: 'caution',
        variant: 'soft',
        icon: 'notifications-outline',
      };
    case 'taken':
      return {
        labelKey: 'status.taken',
        labelParams: { time: formatTime(state.takenAt) },
        tone: 'success',
        variant: 'soft',
        icon: 'checkmark-circle',
      };
    case 'skipped':
      return {
        labelKey: 'status.skipped',
        tone: 'neutral',
        variant: 'soft',
        icon: 'remove-circle-outline',
      };
    case 'missedByUser':
      return {
        labelKey: 'status.missedByUser',
        tone: 'neutral',
        variant: 'soft',
        icon: 'ellipse-outline',
      };
    case 'notConfirmed':
      return {
        labelKey: 'status.notConfirmed',
        tone: 'neutral',
        variant: 'soft',
        icon: 'help-circle-outline',
      };
    case 'pausedOrStopped':
      return null;
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}

export type TrustKind =
  | 'fromDocument'
  | 'addedByYou'
  | 'fromDoctor'
  | 'aiDraft'
  | 'verifiedByYou'
  | 'uncertain';

const TRUST_DISPLAY: Record<TrustKind, StatusDisplay> = {
  fromDocument: {
    labelKey: 'trust.fromDocument',
    tone: 'source',
    variant: 'soft',
    icon: 'document-text-outline',
  },
  addedByYou: {
    labelKey: 'trust.addedByYou',
    tone: 'neutral',
    variant: 'soft',
    icon: 'person-outline',
  },
  fromDoctor: {
    labelKey: 'trust.fromDoctor',
    tone: 'source',
    variant: 'soft',
    icon: 'medkit-outline',
  },
  aiDraft: {
    labelKey: 'trust.aiDraft',
    tone: 'caution',
    variant: 'soft',
    icon: 'sparkles-outline',
  },
  verifiedByYou: {
    labelKey: 'trust.verifiedByYou',
    tone: 'success',
    variant: 'soft',
    icon: 'shield-checkmark-outline',
  },
  uncertain: {
    labelKey: 'trust.uncertain',
    tone: 'caution',
    variant: 'soft',
    // Distinct from the notConfirmed dose icon: the two must not read as the same thing.
    icon: 'alert-circle-outline',
  },
};

export function trustLabelDisplay(kind: TrustKind): StatusDisplay {
  return { ...TRUST_DISPLAY[kind] };
}
