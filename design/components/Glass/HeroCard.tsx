import React from 'react';
import { StyleSheet, View } from 'react-native';
import { darkHeroEdge, layout, radius, space } from '../../tokens';
import { useTheme } from '../../theme';
import { Text } from '../Foundations/Text';
import { GradientFill } from './GradientFill';
import { ProgressRing } from './ProgressRing';
import { ringProgress } from './glassStyle';

export interface HeroCardProps {
  /** Overline, e.g. "Today's medications". */
  label: string;
  /** The big line, e.g. "2 of 5 taken" or "All done for today ✓". */
  headline: string;
  /** Up to two short lines under it, e.g. "Next: Testmed C 10 mg · 1:00 PM". */
  lines?: string[];
  /** Recorded Taken doses and today's total, for the ring only. */
  taken: number;
  total: number;
  testID?: string;
}

// The spec's 135° gradient reaches teal at 135%, so the card's far corner (100%) is part way
// from the 55% blue to teal.
export function heroEndColor(mid: string, teal: string): string {
  const t = (100 - 55) / (135 - 55);
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(ch(mid, i) + (ch(teal, i) - ch(mid, i)) * t).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

// v4 hero: blue to teal gradient, white text kept in the left 60% (the blue side), ring on the right.
export function HeroCard({ label, headline, lines = [], taken, total, testID }: HeroCardProps) {
  const { name, color: c, shadow } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        shadow.hero,
        { borderColor: name === 'dark' ? darkHeroEdge : c.hero.border },
      ]}
    >
      <GradientFill
        direction="diagonal"
        stops={[
          { offset: 0, color: c.hero.from },
          { offset: 0.55, color: c.hero.mid },
          { offset: 1, color: heroEndColor(c.hero.mid, c.hero.to) },
        ]}
      />
      <View style={styles.row}>
        <View style={styles.words}>
          <Text variant="overline" style={{ color: c.text.inverse }}>
            {label}
          </Text>
          <Text variant="title1" tabular style={{ color: c.text.inverse }} testID={testID && `${testID}-headline`}>
            {headline}
          </Text>
          {lines.slice(0, 2).map((line) => (
            <Text key={line} variant="callout" tabular style={{ color: c.text.inverse }}>
              {line}
            </Text>
          ))}
        </View>
        <ProgressRing
          progress={ringProgress(taken, total)}
          color={c.text.inverse}
          trackColor="rgba(255,255,255,0.28)"
          testID={testID && `${testID}-ring`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.hero,
    borderWidth: 1,
    padding: layout.heroPadding,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  words: { flex: 1, gap: space.xs },
});
