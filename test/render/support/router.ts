// TEST ONLY. The search params the expo-router stand-in returns (see setup.tsx). Kept on
// globalThis so it survives vi.resetModules() in renderPreview.
const g = globalThis as { __renderTestSearchParams?: { current: Record<string, string> } };
g.__renderTestSearchParams ??= { current: {} };

export const searchParams = g.__renderTestSearchParams;
