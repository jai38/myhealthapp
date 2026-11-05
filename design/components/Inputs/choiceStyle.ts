import type { IconName } from '../Foundations/iconNames';
import { color } from '../../tokens';

export interface ChoiceColors {
  fg: string;
  bg: string;
  border: string;
  icon: string;
}

export const choiceCheckIcon: IconName = 'checkmark';

// Choices are filled pills or tiles, so they carry no border. Selection is shown by
// the filled blue fill plus a check icon, never by color alone.
export function choiceColors({
  selected,
  disabled,
}: {
  selected: boolean;
  disabled: boolean;
}): ChoiceColors {
  if (disabled) {
    return {
      fg: color.text.secondary,
      bg: color.bg.subtle,
      border: 'transparent',
      icon: color.text.secondary,
    };
  }
  if (selected) {
    return {
      fg: color.text.inverse,
      bg: color.action.primary,
      border: 'transparent',
      icon: color.text.inverse,
    };
  }
  return {
    fg: color.text.primary,
    bg: color.bg.subtle,
    border: 'transparent',
    icon: color.text.secondary,
  };
}

// The visible box can be 36 high. hitSlop adds 6 on each side, so the touch target
// is still 48. Every Pressable that uses this layout must pass hitSlop.
export const choiceLayout = { minHeight: 36, minWidth: 48, hitSlop: 6 } as const;
