// Pure app-status core. No native imports, so Vitest runs it in node.
// Fails open: anything unreachable, malformed or unparseable never blocks the app.

export interface AppStatus {
  minVersion: string;
  latestVersion: string;
  maintenance: { active: boolean; message?: string };
}

export type AppStatusDecision = 'ok' | 'optionalUpdate' | 'requiredUpdate' | 'maintenance';

const VERSION_PATTERN = /^\d+(\.\d+){0,2}$/;

export function isValidVersion(v: unknown): v is string {
  return typeof v === 'string' && VERSION_PATTERN.test(v.trim());
}

function parts(v: string): [number, number, number] {
  const [major = '0', minor = '0', patch = '0'] = v.trim().split('.');
  return [parseInt(major, 10) || 0, parseInt(minor, 10) || 0, parseInt(patch, 10) || 0];
}

/** Negative when a < b, zero when equal, positive when a > b. Missing parts count as 0. */
export function compareVersions(a: string, b: string): number {
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/** Validates the response body ({ data: ... }). Returns null for anything malformed. */
export function parseAppStatus(body: unknown): AppStatus | null {
  if (typeof body !== 'object' || body === null) return null;
  const data = (body as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  if (!isValidVersion(d.minVersion) || !isValidVersion(d.latestVersion)) return null;
  const m = d.maintenance;
  if (typeof m !== 'object' || m === null) return null;
  const active = (m as { active?: unknown }).active;
  if (typeof active !== 'boolean') return null;
  const message = (m as { message?: unknown }).message;
  return {
    minVersion: d.minVersion.trim(),
    latestVersion: d.latestVersion.trim(),
    maintenance: {
      active,
      ...(typeof message === 'string' && message.trim() !== '' ? { message: message.trim() } : {}),
    },
  };
}

/** Maintenance wins, then required, then optional. A missing or unusable input is 'ok'. */
export function appStatusDecision(
  status: AppStatus | null | undefined,
  currentVersion: string | null | undefined,
): AppStatusDecision {
  if (!status) return 'ok';
  if (status.maintenance?.active === true) return 'maintenance';
  if (!isValidVersion(currentVersion)) return 'ok';
  if (isValidVersion(status.minVersion) && compareVersions(currentVersion, status.minVersion) < 0) {
    return 'requiredUpdate';
  }
  if (
    isValidVersion(status.latestVersion) &&
    compareVersions(currentVersion, status.latestVersion) < 0
  ) {
    return 'optionalUpdate';
  }
  return 'ok';
}

/** "Not now" hides the optional nudge only for the latestVersion it was chosen for. */
export function applyDismissal(
  decision: AppStatusDecision,
  status: AppStatus | null,
  dismissedVersion: string | null,
): AppStatusDecision {
  if (decision !== 'optionalUpdate' || !status || dismissedVersion === null) return decision;
  return dismissedVersion === status.latestVersion ? 'ok' : decision;
}

/** At most one check per interval, unless forced. */
export function shouldRecheck(lastCheckedAt: number | null, now: number, minIntervalMs: number): boolean {
  return lastCheckedAt === null || now - lastCheckedAt >= minIntervalMs || now < lastCheckedAt;
}
