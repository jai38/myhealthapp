// Builds the opaque support code shown on the global error screen.
// It takes no arguments on purpose: nothing about the user, the request or the
// error message can reach it. Only a timestamp and random characters.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createSupportCode(now: Date = new Date()): string {
  const stamp = now.getTime().toString(36).toUpperCase();
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `AY-${stamp}-${suffix}`;
}
