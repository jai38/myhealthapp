import type { TextStyle } from 'react-native';
import { textStyles } from '../../typography';
import type { TextStyleName } from '../../typography';
import { textToneColor } from '../../tokens';
import type { TextTone, ThemeColors } from '../../tokens';

export function textStyleFor(variant: TextStyleName, tone: TextTone, theme?: ThemeColors): TextStyle {
  return { ...textStyles[variant], color: theme ? themedToneColor(tone, theme) : textToneColor[tone] };
}

/** A text tone in a v4 theme. In the light theme these equal textToneColor. */
export function themedToneColor(tone: TextTone, c: ThemeColors): string {
  switch (tone) {
    case 'primary':
      return c.text.primary;
    case 'secondary':
      return c.text.secondary;
    case 'tertiary':
      return c.text.tertiary;
    case 'inverse':
      return c.text.inverse;
    case 'link':
      return c.text.link;
    case 'danger':
      return c.text.error;
  }
}
