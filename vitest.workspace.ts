import { defineWorkspace } from 'vitest/config';

// `npx vitest run` runs both projects: the unit tests and the render tests.
export default defineWorkspace(['vitest.config.ts', 'vitest.render.config.ts']);
