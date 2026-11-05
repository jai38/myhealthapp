import React from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps as RNTextProps } from 'react-native';
import { maxFontScaleFor } from '../../typography';
import type { TextStyleName } from '../../typography';
import type { TextTone } from '../../tokens';
import { textStyleFor } from './textStyle';

export interface TextProps extends RNTextProps {
  variant?: TextStyleName;
  tone?: TextTone;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  testID?: string;
}

const HEADING_VARIANTS: ReadonlySet<TextStyleName> = new Set<TextStyleName>([
  'display',
  'title1',
  'title2',
]);

export function Text({
  variant = 'body',
  tone = 'primary',
  align,
  numberOfLines,
  maxFontSizeMultiplier,
  style,
  testID,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      testID={testID}
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? maxFontScaleFor(variant)}
      accessibilityRole={HEADING_VARIANTS.has(variant) ? 'header' : rest.accessibilityRole}
      style={[textStyleFor(variant, tone), align ? { textAlign: align } : null, style]}
    >
      {children}
    </RNText>
  );
}
