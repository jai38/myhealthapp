import { color, radius, size, space } from '../../tokens';
import type { StringKey } from '../../strings';

export type FieldState = 'default' | 'focused' | 'error' | 'disabled';

// Disabled wins over error, error over focused. A disabled field cannot show an error or focus.
export function fieldState({
  focused,
  error,
  disabled,
}: {
  focused: boolean;
  error: boolean;
  disabled: boolean;
}): FieldState {
  if (disabled) return 'disabled';
  if (error) return 'error';
  if (focused) return 'focused';
  return 'default';
}

export function fieldColors(state: FieldState): {
  border: string;
  borderWidth: number;
  bg: string;
  text: string;
  placeholder: string;
} {
  switch (state) {
    case 'disabled':
      // Placeholder is secondary, not tertiary: tertiary fails contrast on bg.subtle.
      // The border stays at border.input so it still meets 3:1 on bg.card.
      return {
        border: color.border.input,
        borderWidth: 1,
        bg: color.bg.subtle,
        text: color.text.secondary,
        placeholder: color.text.secondary,
      };
    case 'error':
      return {
        border: color.action.danger,
        borderWidth: 2,
        bg: color.bg.card,
        text: color.text.primary,
        placeholder: color.text.tertiary,
      };
    case 'focused':
      return {
        border: color.border.focus,
        borderWidth: 2,
        bg: color.bg.card,
        text: color.text.primary,
        placeholder: color.text.tertiary,
      };
    case 'default':
      return {
        border: color.border.input,
        borderWidth: 1,
        bg: color.bg.card,
        text: color.text.primary,
        placeholder: color.text.tertiary,
      };
  }
}

export const fieldLayout = {
  minHeight: size.inputHeight,
  // Same corner as buttons so a form reads as one family.
  borderRadius: radius.control,
  paddingHorizontal: space.lg,
} as const;

// A soft ring drawn just outside the field while focused or in error.
// Decorative only: the 2 px border already carries the state at 3:1.
export const FIELD_HALO_WIDTH = 3;

export function fieldHaloColor(state: FieldState): string {
  if (state === 'focused') return color.tone.info.bg;
  if (state === 'error') return color.tone.danger.bg;
  return 'transparent';
}

// Thicker borders eat into the padding so the text never shifts on focus.
export function fieldPaddingFor(borderWidth: number): number {
  return fieldLayout.paddingHorizontal - (borderWidth - 1);
}

export interface PasswordRule {
  key: StringKey;
  test: (v: string) => boolean;
}

export const defaultPasswordRules: PasswordRule[] = [
  { key: 'password.ruleLength', test: (v) => v.length >= 8 },
  { key: 'password.ruleNumber', test: (v) => /\d/.test(v) },
  { key: 'password.ruleLetter', test: (v) => /[A-Za-z]/.test(v) },
];

export function evaluatePasswordRules(
  value: string,
  rules: PasswordRule[] = defaultPasswordRules,
): { key: StringKey; met: boolean }[] {
  return rules.map((rule) => ({ key: rule.key, met: rule.test(value) }));
}

// Digits only, so pasted codes with spaces or dashes still work.
export function sanitizeOtp(text: string, length = 6): string {
  return text.replace(/\D/g, '').slice(0, length);
}

// Requires digits before the dot. '.5' is rejected rather than guessed as '0.5'.
const DECIMAL = /^-?\d+(\.\d+)?$/;

export function parseDecimal(text: string): number | null {
  const trimmed = text.trim();
  if (!DECIMAL.test(trimmed)) return null;
  return Number(trimmed);
}
