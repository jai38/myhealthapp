import { t } from '../../design/strings';

export type GlobalErrorVariant = 'offline' | 'error';

export function getGlobalErrorCopy(
  variant: GlobalErrorVariant,
  message?: string,
): { title: string; body: string } {
  if (variant === 'offline') {
    return { title: t('globalError.offlineTitle'), body: t('globalError.offlineBody') };
  }
  const trimmed = message?.trim();
  return {
    title: t('globalError.errorTitle'),
    body: trimmed ? trimmed : t('globalError.errorBody'),
  };
}
