import { Button } from './Button';
import { t } from '../../strings';

export interface PasskeyButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

// Visual only. WebAuthn wiring arrives in Phase 5.
export function PasskeyButton({ onPress, disabled, loading, testID }: PasskeyButtonProps) {
  return (
    <Button
      testID={testID}
      label={t('passkey.use')}
      variant="secondary"
      icon="key-outline"
      fullWidth
      onPress={onPress}
      disabled={disabled}
      loading={loading}
    />
  );
}
