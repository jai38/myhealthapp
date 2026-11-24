import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { TokensSection, TOKEN_GROUPS } from '../../design/gallery/sections/TokensSection';
import { ThemeProvider, useTheme } from '../../design/theme';
import { themes } from '../../design/tokens';

function keyPaths(node: unknown, prefix: string): string[] {
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => keyPaths(v, `${prefix}.${k}`));
  }
  return [prefix];
}

function ThemeName() {
  return <Text testID="theme">{useTheme().name}</Text>;
}

const scheme = globalThis as { __rnColorScheme?: 'light' | 'dark' };
afterEach(() => {
  delete scheme.__rnColorScheme;
});

describe('gallery token sheet', () => {
  it('shows every v4 colour token in light and in dark', async () => {
    await render(<TokensSection />);
    for (const name of ['light', 'dark'] as const) {
      expect(screen.getByTestId(`tokens-${name}`)).toBeTruthy();
      const paths = TOKEN_GROUPS.flatMap((g) => keyPaths(themes[name].color[g], g));
      for (const path of paths) expect(screen.getByTestId(`token-${name}-${path}`)).toBeTruthy();
    }
  });

  it('covers every colour group', () => {
    expect([...TOKEN_GROUPS].sort()).toEqual(Object.keys(themes.light.color).sort());
  });
});

describe('useTheme', () => {
  it('follows the system setting', async () => {
    scheme.__rnColorScheme = 'dark';
    await render(<ThemeName />);
    expect(screen.getByTestId('theme').props.children).toBe('dark');
  });

  it('is light when the system is light', async () => {
    await render(<ThemeName />);
    expect(screen.getByTestId('theme').props.children).toBe('light');
  });

  it('a ThemeProvider scheme pins it, and nested providers inherit it', async () => {
    scheme.__rnColorScheme = 'dark';
    await render(
      <ThemeProvider scheme="light">
        <ThemeProvider>
          <ThemeName />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').props.children).toBe('light');
  });
});
