import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'node',
    // Agent worktrees live under .claude/; never collect their copies of the tests.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**', 'test/render/**'],
  },
  resolve: {
    alias: {
      'expo-secure-store': path.resolve(__dirname, 'test/support/expo-secure-store.ts'),
      'expo-local-authentication': path.resolve(__dirname, 'test/support/expo-local-authentication.ts'),
      'expo-clipboard': path.resolve(__dirname, 'test/support/expo-clipboard.ts'),
      'react-native': 'react-native-web',
    },
  },
});
