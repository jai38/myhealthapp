import type { IconName } from '../Foundations/iconNames';
import { color, size } from '../../tokens';

export interface ChoiceColors {
  fg: string;
  bg: string;
  border: string;
  icon: string;
}

export const choiceCheckIcon: IconName = 'checkmark';

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
      border: color.border.subtle,
      icon: color.text.secondary,
    };
  }
  if (selected) {
    return {
      fg: color.tone.info.fg,
      bg: color.tone.info.bg,
      border: color.action.primary,
      icon: color.action.primary,
    };
  }
  return {
    fg: color.text.primary,
    bg: color.bg.screen,
    border: color.border.input,
    icon: color.border.input,
  };
}

export const choiceLayout = { minHeight: size.touchMin, minWidth: size.touchMin } as const;
