import React, { useState } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, UserSession } from '../../services/auth/auth-service';
import { WaveHeader } from '../../design/components/Foundations/WaveHeader';
import { Text } from '../../design/components/Foundations/Text';
import { Icon } from '../../design/components/Foundations/Icon';
import { Logo } from '../../design/components/Foundations/Logo';
import { Card } from '../../design/components/Containers/Card';
import { SegmentedControl } from '../../design/components/Containers/SegmentedControl';
import { Button } from '../../design/components/Actions/Button';
import { EmailField } from '../../design/components/Inputs/EmailField';
import { PasswordField } from '../../design/components/Inputs/PasswordField';
import { TextField } from '../../design/components/Inputs/TextField';
import { color, space, radius } from '../../design/tokens';
import { t } from '../../design/strings';
import { shouldShowOfflineBanner } from '../../services/network/connectivity';
import { useConnectivity } from '../../services/network/useConnectivity';

export interface AuthScreenProps {
  onSuccess?: (session: UserSession) => void;
  initialMode?: 'login' | 'signup';
  // True when the last session ended by expiry; shows a calm note. Never after a deliberate sign-out.
  sessionEnded?: boolean;
}

// A failed fetch (no connection) surfaces as a TypeError in React Native and browsers.
function isNetworkFailure(err: unknown): boolean {
  return err instanceof TypeError;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialMode = 'login',
  sessionEnded = false,
}) => {
  const { status } = useConnectivity();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(t('auth.emailRequired'));
      return;
    }

    if (!password) {
      setErrorMessage(t('auth.passwordRequired'));
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setErrorMessage(t('auth.passwordTooShort'));
      return;
    }

    // Offline: say so calmly instead of sending a request that cannot succeed.
    if (shouldShowOfflineBanner(status)) {
      setErrorMessage(t('auth.offlineSignIn'));
      return;
    }

    setLoading(true);
    try {
      let session: UserSession;
      if (mode === 'login') {
        session = await authService.login(trimmedEmail, password);
      } else {
        session = await authService.signup(trimmedEmail, password, fullName.trim() || undefined);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(session);
      }
    } catch (err: unknown) {
      setLoading(false);
      if (isNetworkFailure(err)) {
        setErrorMessage(t('auth.offlineSignIn'));
        return;
      }
      const msg = err instanceof Error ? err.message : t('auth.authFailed');
      setErrorMessage(msg);
      Alert.alert(t('auth.errorAlertTitle'), msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* The wave belongs to this white screen only, behind the logo. */}
      <View pointerEvents="none" style={styles.waveSlot}>
        <WaveHeader />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Logo variant="full" size={40} />
            <Text variant="callout" tone="secondary" align="center" style={styles.brandTagline}>
              {t('auth.tagline')}
            </Text>
            <View style={styles.cloudBadge}>
              <Icon name="cloud-done-outline" size="sm" tone="success" />
              <Text variant="caption" tone="secondary">
                {t('auth.cloudBadge')}
              </Text>
            </View>
          </View>

          <Card>
            {/* Mode switch. Blocked while a request is in flight, as before. */}
            <View pointerEvents={loading ? 'none' : 'auto'} style={styles.modeSwitch}>
              <SegmentedControl<'login' | 'signup'>
                options={[
                  { value: 'login', label: t('auth.tabSignIn') },
                  { value: 'signup', label: t('auth.tabCreate') },
                ]}
                value={mode}
                onChange={handleModeChange}
              />
            </View>

            <View style={styles.formHeader}>
              <Text variant="title2">
                {mode === 'login' ? t('auth.welcomeBack') : t('auth.getStarted')}
              </Text>
              <Text variant="callout" tone="secondary" style={styles.formIntro}>
                {mode === 'login' ? t('auth.loginIntro') : t('auth.signupIntro')}
              </Text>
            </View>

            {sessionEnded && (
              <View style={styles.sessionNote} accessibilityRole="alert" testID="session-ended-note">
                <Text variant="body" tone="primary">
                  {t('auth.sessionEnded')}
                </Text>
              </View>
            )}

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Icon name="warning-outline" tone="danger" />
                <Text variant="caption" tone="danger" style={styles.flex}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {mode === 'signup' && (
              <TextField
                label={t('auth.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                disabled={loading}
              />
            )}

            <EmailField
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
              disabled={loading}
            />

            <PasswordField
              label={t('auth.password')}
              placeholder={
                mode === 'signup' ? t('auth.passwordPlaceholderSignup') : t('auth.passwordPlaceholderLogin')
              }
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              helper={mode === 'signup' ? t('auth.passwordHelper') : undefined}
              disabled={loading}
            />

            <View style={styles.actionContainer}>
              <Button
                label={
                  loading
                    ? t('auth.connecting')
                    : mode === 'login'
                    ? t('auth.signInAction')
                    : t('auth.createAction')
                }
                variant="primary"
                fullWidth
                onPress={handleSubmit}
                loading={loading}
              />
            </View>

            {/* Quick switch prompt */}
            <Pressable
              accessibilityRole="button"
              style={styles.switchPrompt}
              onPress={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
            >
              <Text variant="caption" tone="secondary" align="center">
                {mode === 'login' ? t('auth.noAccountPrompt') : t('auth.haveAccountPrompt')}{' '}
                <Text variant="caption" tone="link">
                  {mode === 'login' ? t('auth.tabCreate') : t('auth.tabSignIn')}
                </Text>
              </Text>
            </Pressable>
          </Card>

          <View style={styles.trustFooter}>
            <Icon name="lock-closed-outline" size="sm" tone="tertiary" />
            <Text variant="caption" tone="tertiary" align="center" style={styles.trustText}>
              {t('auth.trustFooter')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.bg.card,
  },
  waveSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: space.xl,
    gap: space.xs,
  },
  brandTagline: {
    marginTop: space.xs,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.bg.card,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    marginTop: space.sm,
  },
  modeSwitch: {
    marginBottom: space.lg,
  },
  formHeader: {
    marginBottom: space.md,
    gap: space.xs,
  },
  formIntro: {
    marginTop: space.xxs,
  },
  sessionNote: {
    backgroundColor: color.tone.info.bg,
    borderRadius: radius.sm,
    padding: space.md,
    marginBottom: space.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: color.tone.danger.bg,
    borderRadius: radius.sm,
    padding: space.md,
    marginBottom: space.md,
  },
  flex: {
    flex: 1,
  },
  actionContainer: {
    marginTop: space.md,
  },
  switchPrompt: {
    marginTop: space.lg,
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  trustFooter: {
    marginTop: space.xl,
    alignItems: 'center',
    paddingHorizontal: space.sm,
    gap: space.xs,
  },
  trustText: {
    maxWidth: 400,
  },
});
