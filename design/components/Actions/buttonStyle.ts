import { color, radius, size, space } from '../../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

export function buttonColors(
  variant: ButtonVariant,
  state: { pressed: boolean; disabled: boolean },
): { bg: string; fg: string; border: string } {
  if (state.disabled) {
    // Disabled text stays readable on purpose: slate on Cool Grey passes 4.5:1.
    return { bg: color.bg.subtle, fg: color.text.secondary, border: color.border.subtle };
  }
  // Link blue on the blue tint is only 4.0:1, so pressed text darkens to the pressed blue (4.97:1).
  const linkFg = state.pressed ? color.action.primaryPressed : color.text.link;
  switch (variant) {
    case 'primary': {
      const bg = state.pressed ? color.action.primaryPressed : color.action.primary;
      return { bg, fg: color.text.inverse, border: bg };
    }
    case 'secondary':
      return {
        bg: state.pressed ? color.bg.tintBlue : color.bg.screen,
        fg: linkFg,
        border: color.action.primary,
      };
    case 'text':
      return {
        bg: state.pressed ? color.bg.tintBlue : 'transparent',
        fg: linkFg,
        border: 'transparent',
      };
    case 'danger':
      return { bg: color.action.danger, fg: color.text.inverse, border: color.action.danger };
  }
}

export const buttonLayout = {
  minHeight: size.buttonHeight,
  minWidth: size.touchMin,
  paddingHorizontal: space.xl,
  borderRadius: radius.md,
  borderWidth: 1.5,
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
