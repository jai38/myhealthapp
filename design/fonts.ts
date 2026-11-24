import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

// Plus Jakarta Sans at the three weights the v4 spec uses (400, 600, 700). It has no Devanagari,
// so Hindi text falls back to the system's Devanagari face (Noto Sans Devanagari on Android).
// Never blocks the app. On error, loaded is true and the system font is used.
export function useAppFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  return { loaded: loaded || error !== null, error };
}
