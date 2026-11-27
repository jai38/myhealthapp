// TEST ONLY. In-memory stand-in for expo-secure-store (a native module that can't load in Node).
const store = new Map<string, string>();
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';
export async function getItemAsync(key: string): Promise<string | null> {
  return store.get(key) ?? null;
}
export async function setItemAsync(key: string, value: string): Promise<void> {
  store.set(key, value);
}
export async function deleteItemAsync(key: string): Promise<void> {
  store.delete(key);
}
export function __resetSecureStore(): void {
  store.clear();
}
