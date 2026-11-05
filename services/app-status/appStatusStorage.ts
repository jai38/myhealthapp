// Remembers "Not now" for one latestVersion. Works without storage: every call is guarded.

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export const DISMISSED_VERSION_KEY = 'appStatus.dismissedLatestVersion';

export async function loadDismissedVersion(store: KeyValueStore | null): Promise<string | null> {
  if (!store) return null;
  try {
    return await store.getItem(DISMISSED_VERSION_KEY);
  } catch {
    return null;
  }
}

export async function saveDismissedVersion(store: KeyValueStore | null, version: string): Promise<void> {
  if (!store) return;
  try {
    await store.setItem(DISMISSED_VERSION_KEY, version);
  } catch {
    // The nudge may return next launch; nothing else depends on this.
  }
}
