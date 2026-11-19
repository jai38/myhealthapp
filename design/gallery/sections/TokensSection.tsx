import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/Foundations/Text';
import { layout, motion, radius, space, themes } from '../../tokens';
import type { ThemeColors, ThemeName } from '../../tokens';
import { ThemeProvider, useTheme } from '../../theme';
import { GallerySection, GalleryItem } from '../GallerySection';

// Calm Glass UI v4 tokens, light and dark side by side. Each board pins its theme, so both show
// whatever the phone's own setting is. Gradients show as their stops until the hero card and the
// primary button draw them (04b task 11).

type Swatch = { path: string; value: string };

function swatches(node: unknown, prefix = ''): Swatch[] {
  if (typeof node === 'string') return [{ path: prefix, value: node }];
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => swatches(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

export const TOKEN_GROUPS: (keyof ThemeColors)[] = [
  'bg',
  'text',
  'action',
  'brand',
  'hero',
  'mesh',
  'dose',
  'supplement',
];

function TokenBoard() {
  const { name, color: c } = useTheme();
  const label = { color: c.text.primary };
  const meta = { color: c.text.secondary };
  return (
    <View
      testID={`tokens-${name}`}
      style={{
        backgroundColor: c.bg.screen,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: c.bg.glassHairline,
        padding: layout.cardPadding,
        gap: space.lg,
      }}
    >
      <Text variant="title3" style={label}>
        {name === 'light' ? 'Light' : 'Dark'}
      </Text>
      {TOKEN_GROUPS.map((group) => (
        <View key={group} style={{ gap: space.sm }}>
          <Text variant="overline" style={meta}>
            {group}
          </Text>
          {swatches(c[group], group).map((s) => (
            <View
              key={s.path}
              testID={`token-${name}-${s.path}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.iconChip,
                  backgroundColor: s.value,
                  borderWidth: 1,
                  borderColor: c.bg.divider,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="caption" style={label}>
                  {s.path}
                </Text>
                <Text variant="caption" style={meta}>
                  {s.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
      <View style={{ gap: space.sm }}>
        <Text variant="overline" style={meta}>
          dose chips
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {(['taken', 'upcoming', 'notConfirmed', 'missed'] as const).map((k) => (
            <View
              key={k}
              style={{ backgroundColor: c.dose[k].bg, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.xs }}
            >
              <Text variant="caption" style={{ color: c.dose[k].fg }}>
                {k}
              </Text>
            </View>
          ))}
          <View
            style={{ backgroundColor: c.dose.dueNow.to, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.xs }}
          >
            <Text variant="caption" style={{ color: c.dose.dueNow.fg }}>
              dueNow
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Board({ scheme }: { scheme: ThemeName }) {
  return (
    <ThemeProvider scheme={scheme}>
      <TokenBoard />
    </ThemeProvider>
  );
}

export function TokensSection() {
  return (
    <GallerySection title="Tokens (v4)" testID="gallery-tokens">
      <GalleryItem label="Colours, light and dark">
        <View style={{ gap: space.lg }}>
          {(Object.keys(themes) as ThemeName[]).map((scheme) => (
            <Board key={scheme} scheme={scheme} />
          ))}
        </View>
      </GalleryItem>
      <GalleryItem label="Radii">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {(['hero', 'card', 'tile', 'input', 'iconChip'] as const).map((r) => (
            <View key={r} style={{ alignItems: 'center', gap: space.xs }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: radius[r],
                  backgroundColor: themes.light.color.bg.tintBlue,
                }}
              />
              <Text variant="caption" tone="secondary">
                {`${r} ${radius[r]}`}
              </Text>
            </View>
          ))}
        </View>
      </GalleryItem>
      <GalleryItem label="Layout and motion">
        <Text variant="caption" tone="secondary">
          {`Margin ${layout.screenMargin} · section gap ${layout.sectionGap} · row min ${layout.rowMinHeight} · tab bar ${layout.tabBar.height} high, inset ${layout.tabBar.inset}, bottom ${layout.tabBar.bottom}`}
        </Text>
        <Text variant="caption" tone="secondary">
          {`Motion ${motion.duration.fast} / ${motion.duration.base} / ${motion.duration.slow} ms, cubic-bezier(${motion.easing.bezier.join(', ')})`}
        </Text>
      </GalleryItem>
    </GallerySection>
  );
}
