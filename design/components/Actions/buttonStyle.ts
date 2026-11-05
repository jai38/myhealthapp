import { color, radius, size, space } from '../../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

// Secondary and text buttons dim while pressed instead of changing color.
export const PRESSED_OPACITY = 0.7;

// Every variant shrinks slightly while held, unless reduce motion is on.
export const PRESSED_SCALE = 0.97;

export function buttonColors(
  variant: ButtonVariant,
  state: { pressed: boolean; disabled: boolean },
): { bg: string; fg: string; border: string } {
  if (state.disabled) {
    // Disabled text stays readable on purpose: slate on the grey fill passes 4.5:1.
    return { bg: color.bg.subtle, fg: color.text.secondary, border: 'transparent' };
  }
  switch (variant) {
    case 'primary': {
      const bg = state.pressed ? color.action.primaryPressed : color.action.primary;
      return { bg, fg: color.text.inverse, border: bg };
    }
    case 'secondary':
      return { bg: color.bg.tintBlue, fg: color.text.link, border: 'transparent' };
    case 'text':
      return { bg: 'transparent', fg: color.text.link, border: 'transparent' };
    case 'danger':
      return { bg: color.action.danger, fg: color.text.inverse, border: color.action.danger };
  }
}

export const buttonLayout = {
  minHeight: size.buttonHeight,
  minWidth: size.touchMin,
  paddingHorizontal: space.xl,
  borderRadius: radius.control,
  borderWidth: 0,
} as const;

export const iconButtonLayout = {
  width: size.touchMin,
  height: size.touchMin,
  borderRadius: radius.full,
} as const;

export const linkRowLayout = {
  minHeight: size.touchMin,
} as const;

export const UNDO_DURATION_MS = 6000;
