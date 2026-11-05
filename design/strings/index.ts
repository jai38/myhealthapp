import { en } from './en';

export type StringKey = keyof typeof en;
export type StringParams = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Look up a string by key and fill {name} placeholders from params.
 * A placeholder without a matching param is left as written, so gaps stay visible.
 * An unknown key returns the key itself. This function never throws.
 */
export function t(key: StringKey, params?: StringParams): string {
  const template: string | undefined = Object.prototype.hasOwnProperty.call(en, key)
    ? (en[key] as string)
    : undefined;
  if (template === undefined) return String(key);
  if (!params) return template;
  return template.replace(PLACEHOLDER, (match: string, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

export { en };
