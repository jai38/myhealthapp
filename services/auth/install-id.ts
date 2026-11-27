// A random id made once per install and kept in secure storage (api.md "installId"). The server
// keeps only a keyed hash of it; it's how a phone it has seen before is recognised (Phase 5 P2).
import { secureStorage } from './secure-storage';

const KEY = '@myhealthapp/install_id';

function uuidV4(random: () => number = Math.random): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(random() * 256);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

let cached: string | null = null;

export async function getInstallId(): Promise<string> {
  if (cached) return cached;
  const stored = await secureStorage.getItem(KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const id = uuidV4();
  await secureStorage.setItem(KEY, id);
  cached = id;
  return id;
}

export const __forTests = { uuidV4, reset: () => { cached = null; } };
