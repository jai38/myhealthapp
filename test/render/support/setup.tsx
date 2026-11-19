// TEST ONLY. Setup for the render tests: stand-ins for native Expo modules, which cannot load in
// Node. Each one is the smallest thing the screens need. No module here talks to a network,
// a disk or a real account; data comes from the dev-preview synthetic fixtures.
import React from 'react';
import { configure } from '@testing-library/react-native';
import { vi } from 'vitest';

(globalThis as Record<string, unknown>).__DEV__ = true;
// RNTL wraps renders in act(); React needs to know this environment supports it.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
// The screens load their data after the first render; allow for a busy machine.
configure({ asyncUtilTimeout: 5000 });

const memoryStorage = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => memoryStorage.get(k) ?? null,
    setItem: async (k: string, v: string) => void memoryStorage.set(k, v),
    removeItem: async (k: string) => void memoryStorage.delete(k),
    multiRemove: async (ks: string[]) => ks.forEach((k) => memoryStorage.delete(k)),
    getAllKeys: async () => [...memoryStorage.keys()],
    clear: async () => memoryStorage.clear(),
  },
}));

vi.mock('expo-router', async () => {
  const { searchParams } = await import('./router');
  const router = { push: () => {}, replace: () => {}, back: () => {}, navigate: () => {}, setParams: () => {} };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: () => searchParams.current,
    useGlobalSearchParams: () => searchParams.current,
    usePathname: () => '/',
    useSegments: () => [],
    useFocusEffect: () => {},
    Redirect: () => null,
    Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
    Stack: Object.assign(() => null, { Screen: () => null }),
    Tabs: Object.assign(() => null, { Screen: () => null }),
  };
});

vi.mock('react-native-safe-area-context', async () => {
  const { View } = await import('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 360, height: 800 }),
    initialWindowMetrics: { insets, frame: { x: 0, y: 0, width: 360, height: 800 } },
  };
});

vi.mock('@expo/vector-icons', () => {
  const Icon = ({ name, ...props }: { name: string }) => React.createElement('Icon', { name, ...props });
  return { Ionicons: Icon, MaterialIcons: Icon, MaterialCommunityIcons: Icon };
});

vi.mock('react-native-svg', () => {
  const svgHost = (name: string) => (props: { children?: React.ReactNode }) =>
    React.createElement(name, props, props.children);
  return {
    default: svgHost('Svg'),
    Svg: svgHost('Svg'),
    Path: svgHost('Path'),
    Circle: svgHost('Circle'),
    Rect: svgHost('Rect'),
    G: svgHost('G'),
    Defs: svgHost('Defs'),
    LinearGradient: svgHost('LinearGradient'),
    Stop: svgHost('Stop'),
  };
});

vi.mock('@expo-google-fonts/inter', () => ({
  useFonts: () => [true, null],
  Inter_400Regular: 0,
  Inter_500Medium: 0,
  Inter_600SemiBold: 0,
  Inter_700Bold: 0,
}));

vi.mock('expo-constants', () => ({
  default: { expoConfig: { name: 'Ayoreni', version: '1.0.0', extra: {} }, executionEnvironment: 'storeClient' },
}));

vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('expo-sharing', () => ({ isAvailableAsync: async () => false, shareAsync: async () => {} }));
vi.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///test/',
  cacheDirectory: 'file:///test-cache/',
  getInfoAsync: async () => ({ exists: false }),
  makeDirectoryAsync: async () => {},
  copyAsync: async () => {},
  deleteAsync: async () => {},
  readAsStringAsync: async () => '',
  writeAsStringAsync: async () => {},
  downloadAsync: async () => ({ uri: '', status: 200 }),
}));
vi.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: async () => ({ granted: false }),
  requestMediaLibraryPermissionsAsync: async () => ({ granted: false }),
  launchCameraAsync: async () => ({ canceled: true, assets: null }),
  launchImageLibraryAsync: async () => ({ canceled: true, assets: null }),
  MediaTypeOptions: { Images: 'Images' },
}));
vi.mock('expo-document-picker', () => ({
  getDocumentAsync: async () => ({ canceled: true, assets: null }),
}));
vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: () => () => {},
    fetch: async () => ({ isConnected: true, isInternetReachable: true }),
  },
}));
vi.mock('expo-notifications', () => import('../../mocks/expo-notifications'));
