import { describe, it, expect } from 'vitest';
import {
  DEV_URL_MISSING,
  LOCAL_API_URL,
  PROD_API_URL,
  ENV_SCOPED_STORAGE_KEYS,
  environmentFingerprint,
  resolveApiBaseUrl,
  resolveAppEnv,
} from '../services/config/environment';

const DEV = 'https://abc123.execute-api.ap-south-1.amazonaws.com/api/v1';

describe('backend environment switch', () => {
  it('defaults to prod when nothing is set or the value is unknown', () => {
    expect(resolveAppEnv({})).toBe('prod');
    expect(resolveAppEnv({ appEnv: 'staging' })).toBe('prod');
    expect(resolveApiBaseUrl({})).toBe(PROD_API_URL);
  });

  it('uses the dev URL for dev and never falls back to prod', () => {
    expect(resolveApiBaseUrl({ appEnv: 'dev', devApiUrl: DEV })).toBe(DEV);
    expect(resolveApiBaseUrl({ appEnv: 'dev' })).toBe(DEV_URL_MISSING);
    expect(resolveApiBaseUrl({ appEnv: 'dev', devApiUrl: 'REPLACE_WITH_terraform_output_dev_api_url' })).toBe(DEV_URL_MISSING);
    expect(resolveApiBaseUrl({ appEnv: 'DEV', devApiUrl: DEV })).toBe(DEV);
  });

  it('uses localhost for local unless another local URL is given', () => {
    expect(resolveApiBaseUrl({ appEnv: 'local' })).toBe(LOCAL_API_URL);
    expect(resolveApiBaseUrl({ appEnv: 'local', localApiUrl: 'http://192.168.0.5:4000/api/v1' })).toBe('http://192.168.0.5:4000/api/v1');
  });

  it('lets an explicit EXPO_PUBLIC_API_URL win, and ignores an empty one', () => {
    expect(resolveApiBaseUrl({ appEnv: 'dev', devApiUrl: DEV, apiUrl: 'http://x/api/v1' })).toBe('http://x/api/v1');
    expect(resolveApiBaseUrl({ appEnv: 'dev', devApiUrl: DEV, apiUrl: '' })).toBe(DEV);
  });

  it('gives each backend its own fingerprint, so switching clears session and caches', () => {
    const prod = environmentFingerprint({});
    const dev = environmentFingerprint({ appEnv: 'dev', devApiUrl: DEV });
    expect(prod).not.toBe(dev);
    expect(ENV_SCOPED_STORAGE_KEYS).toContain('@myhealthapp/user_session');
    expect(ENV_SCOPED_STORAGE_KEYS).toContain('@myhealthapp/persisted_doses');
  });
});
