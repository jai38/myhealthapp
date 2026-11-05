// Update destinations. Until the app is listed in the stores, the Update button opens the landing page.
// Replace these two with the real store listings when they exist.
export const LANDING_PAGE_URL = 'https://jai38.github.io/MyHealth/';
export const APP_STORE_URL = LANDING_PAGE_URL;
export const PLAY_STORE_URL = LANDING_PAGE_URL;

export function updateUrlFor(platform: string): string {
  if (platform === 'ios') return APP_STORE_URL;
  if (platform === 'android') return PLAY_STORE_URL;
  return LANDING_PAGE_URL;
}
