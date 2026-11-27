// App lock (Phase 5 task 12, P1; screens.md A01). The phone's own biometrics or PIN through
// expo-local-authentication: the face or fingerprint never leaves the phone, and Ayoreni
// stores only whether the lock is on.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const KEY = '@myhealthapp/app_lock';

export type AppStateName = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

/** Locks when the app goes to the background (A01 "Locks when you leave"). */
export function shouldLock(next: AppStateName, enabled: boolean): boolean {
  return enabled && next === 'background';
}

export async function isAppLockOn(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'on';
  } catch {
    return false;
  }
}

export async function setAppLock(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Storage unavailable: the lock stays as it was.
  }
}

/** True when the phone has a biometric or a PIN/passcode set, so app lock can work. */
export async function canUseAppLock(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level > LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

export type LockMethod = 'faceId' | 'fingerprint' | 'pin';

export async function lockMethod(): Promise<LockMethod> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'faceId';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  } catch {
    // Fall through.
  }
  return 'pin';
}

/**
 * Asks the phone to confirm it's the owner. The system prompt also offers the phone's PIN or
 * passcode (device fallback is allowed), which is what "Use Phone PIN" relies on:
 * expo-local-authentication can't open the PIN prompt on its own. Returns true only on success.
 */
export async function unlockWithDevice(promptMessage: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: false,
    });
    return result.success === true;
  } catch {
    return false;
  }
}
