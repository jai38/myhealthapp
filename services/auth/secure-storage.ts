// Secrets on the phone: access and refresh tokens and the install id (Phase 5 task 11).
// On iOS and Android they go to the system keychain / keystore through expo-secure-store.
// The web build has no secure store, so there they fall back to the browser's storage, as
// before; the web build is a preview, not where patients keep their records.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// SecureStore keys allow only letters, digits, ".", "-" and "_".
const toKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

const memory = new Map<string, string>();

function webStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** True where tokens are kept in the system keychain / keystore. */
export function usesSecureHardwareStore(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (usesSecureHardwareStore()) {
      try {
        return await SecureStore.getItemAsync(toKey(key));
      } catch {
        return null;
      }
    }
    return webStorage()?.getItem(key) ?? memory.get(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (usesSecureHardwareStore()) {
      await SecureStore.setItemAsync(toKey(key), value, {
        // Readable only while the phone is unlocked, and never restored to another phone.
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return;
    }
    memory.set(key, value);
    try {
      webStorage()?.setItem(key, value);
    } catch {
      // Private browsing: the in-memory copy still works for this visit.
    }
  },
  async removeItem(key: string): Promise<void> {
    if (usesSecureHardwareStore()) {
      try {
        await SecureStore.deleteItemAsync(toKey(key));
      } catch {
        // Nothing stored.
      }
      return;
    }
    memory.delete(key);
    try {
      webStorage()?.removeItem(key);
    } catch {
      // ignore
    }
  },
};
