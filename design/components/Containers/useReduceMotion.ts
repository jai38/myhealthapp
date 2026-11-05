import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Last known value, shared across mounts so only the app's very first read can
// briefly run motion. If the read fails, motion stays on (the normal default).
let lastKnown = false;

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(lastKnown);

  useEffect(() => {
    let active = true;
    const update = (enabled: boolean) => {
      lastKnown = enabled;
      if (active) setReduceMotion(enabled);
    };
    AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
