import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Render tests (test/render/**): React Native Testing Library over a test-only `react-native`
// stand-in. See test/render/support/react-native.tsx for why it is not react-native-web.
export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  test: {
    name: 'render',
    environment: 'node',
    // RNTL registers its matchers and its after-each cleanup on the global `expect`/`afterEach`.
    globals: true,
    include: ['test/render/**/*.test.{ts,tsx}'],
    setupFiles: ['test/render/support/require-hook.ts', 'test/render/support/setup.tsx'],
  },
  resolve: {
    alias: {
      'expo-secure-store': path.resolve(__dirname, 'test/support/expo-secure-store.ts'),
      'expo-local-authentication': path.resolve(__dirname, 'test/support/expo-local-authentication.ts'),
      'expo-clipboard': path.resolve(__dirname, 'test/support/expo-clipboard.ts'),
      'react-native': path.resolve(__dirname, 'test/render/support/react-native.tsx'),
    },
  },
});
