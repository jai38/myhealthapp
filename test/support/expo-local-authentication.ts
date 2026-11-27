// TEST ONLY. Stand-in for expo-local-authentication. Tests set the next result.
export const AuthenticationType = { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 } as const;
export const SecurityLevel = { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 } as const;
let next: { success: boolean; error?: string } = { success: true };
let level = 3;
let types: number[] = [2];
export function __setNextAuthResult(result: { success: boolean; error?: string }): void {
  next = result;
}
export function __setEnrolledLevel(l: number, t: number[] = [2]): void {
  level = l;
  types = t;
}
export const calls: { options: unknown }[] = [];
export async function authenticateAsync(options?: unknown) {
  calls.push({ options });
  return next;
}
export async function getEnrolledLevelAsync() {
  return level;
}
export async function hasHardwareAsync() {
  return true;
}
export async function isEnrolledAsync() {
  return level > 0;
}
export async function supportedAuthenticationTypesAsync() {
  return types;
}
