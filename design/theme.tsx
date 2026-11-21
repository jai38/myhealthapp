import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { themes } from './tokens';
import type { Theme, ThemeName } from './tokens';

// The v4 theme follows the phone's light or dark setting. A ThemeProvider with `scheme` pins it,
// for the gallery's side-by-side boards, the dev preview and tests.
//
// Until every screen reads useTheme(), the app root pins APP_THEME_PIN ('light'), so a phone or
// browser in dark mode never gets themed parts over screens that are still light. When every tab
// reads it, set the pin to undefined and app.json's `userInterfaceStyle` to "automatic".

/** The theme the app root pins; undefined follows the system. */
export const APP_THEME_PIN: ThemeName | undefined = 'light';

const ThemeOverride = createContext<ThemeName | null>(null);

export function resolveThemeName(
  system: string | null | undefined,
  override: ThemeName | null,
): ThemeName {
  if (override) return override;
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({
  scheme,
  children,
}: {
  scheme?: ThemeName;
  children: React.ReactNode;
}) {
  const parent = useContext(ThemeOverride);
  return (
    <ThemeOverride.Provider value={scheme ?? parent}>{children}</ThemeOverride.Provider>
  );
}

export function useTheme(): Theme {
  const override = useContext(ThemeOverride);
  const system = useColorScheme();
  return themes[resolveThemeName(system, override)];
}
