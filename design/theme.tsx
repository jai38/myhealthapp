import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { themes } from './tokens';
import type { Theme, ThemeName } from './tokens';

// The v4 theme follows the phone's light or dark setting. A ThemeProvider with `scheme` pins it,
// for the gallery's side-by-side boards, the dev preview and tests.
//
// Native builds report the system setting only once app.json's `userInterfaceStyle` is
// "automatic"; the web build follows the browser at once. So a part moves to useTheme() only
// together with the screen around it (04b tasks 11 and 13), and `userInterfaceStyle` flips to
// "automatic" when every tab reads it. Until then the app is light, from the `color` export.

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
