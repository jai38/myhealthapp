import { AppStatus, parseAppStatus } from './appStatus';

export const APP_STATUS_TIMEOUT_MS = 4000;

/**
 * Public, unauthenticated GET {baseUrl}/app-status. Never throws and sends no auth header.
 * Returns null when unreachable, slow, non-200 or malformed (the caller then fails open).
 */
export async function fetchAppStatus(
  baseUrl: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<AppStatus | null> {
  const timeoutMs = options.timeoutMs ?? APP_STATUS_TIMEOUT_MS;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const fetchImpl = options.fetchImpl ?? fetch;
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        controller?.abort();
        resolve(null);
      }, timeoutMs);
    });
    const request = (async () => {
      const res = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/app-status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller?.signal,
      });
      if (!res.ok) return null;
      return parseAppStatus(await res.json());
    })().catch(() => null);
    return await Promise.race([request, timeout]);
  } catch {
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
