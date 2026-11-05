import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Agent worktrees live under .claude/; never collect their copies of the tests.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
