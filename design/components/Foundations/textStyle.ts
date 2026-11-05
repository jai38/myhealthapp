import type { TextStyle } from 'react-native';
import { textStyles } from '../../typography';
import type { TextStyleName } from '../../typography';
import { textToneColor } from '../../tokens';
import type { TextTone } from '../../tokens';

export function textStyleFor(variant: TextStyleName, tone: TextTone): TextStyle {
  return { ...textStyles[variant], color: textToneColor[tone] };
}
