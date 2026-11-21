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

// The spec's 135° gradient reaches teal at 135%, so at the card's far corner it is part way
// from the 55% blue to teal: #00A7C6.
const HERO_END = '#00A7C6';

// v4 hero: blue to teal gradient, white text kept on the blue (left) side, ring on the right.
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
          { offset: 1, color: HERO_END },
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
