import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService, UserSession } from '../../services/auth/auth-service';
import { Text } from '../../design/components/Foundations/Text';
import { Icon } from '../../design/components/Foundations/Icon';
import { IconButton } from '../../design/components/Actions/IconButton';
import { Button } from '../../design/components/Actions/Button';
import { SegmentedControl } from '../../design/components/Containers/SegmentedControl';
import { EmailField } from '../../design/components/Inputs/EmailField';
import { PasswordField } from '../../design/components/Inputs/PasswordField';
import { TextField } from '../../design/components/Inputs/TextField';
import { LegalTermsModal } from '../legal/LegalTermsModal';
import { color, elevation, radius, space } from '../../design/tokens';
import { t } from '../../design/strings';

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (session: UserSession) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalInitialTab, setLegalModalInitialTab] = useState<'terms' | 'privacy'>('terms');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const handleOpenLegal = (tab: 'terms' | 'privacy') => {
    setLegalModalInitialTab(tab);
    setShowLegalModal(true);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim()) {
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

    if (mode === 'signup' && !agreedToTerms) {
      setErrorMessage(t('auth.consentRequired'));
      return;
    }

    setLoading(true);
    try {
      let session: UserSession;
      if (mode === 'login') {
        session = await authService.login(email, password);
      } else {
        session = await authService.signup(email, password, fullName);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(session);
      }
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : t('auth.authFailed');
      setErrorMessage(msg);
    }
  };

  const isLogin = mode === 'login';

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.overlay}>
          {/* Scrim: a token-coloured layer behind the sheet. Not pressable, as before. */}
          <View style={styles.scrim} pointerEvents="none" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetLayer}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text variant="title2">{isLogin ? t('auth.welcomeBack') : t('auth.tabCreate')}</Text>
                  <Text variant="callout" tone="secondary">
                    {isLogin ? t('auth.modalSignInIntro') : t('auth.modalCreateIntro')}
                  </Text>
                </View>
                <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
              </View>

              <View style={styles.modeSwitch}>
                <SegmentedControl<'login' | 'signup'>
                  options={[
                    { value: 'login', label: t('auth.tabSignIn') },
                    { value: 'signup', label: t('auth.tabCreate') },
                  ]}
                  value={mode}
                  onChange={handleModeChange}
                />
              </View>

              <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <Text variant="caption" tone="danger">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                {mode === 'signup' ? (
                  <TextField
                    label={t('auth.fullName')}
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    disabled={loading}
                  />
                ) : null}

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
                  placeholder={isLogin ? t('auth.passwordPlaceholderLogin') : t('auth.passwordPlaceholderSignup')}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  helper={mode === 'signup' ? t('auth.passwordHelper') : undefined}
                  disabled={loading}
                />

                {mode === 'signup' ? (
                  <View style={styles.consentRow}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: agreedToTerms }}
                      onPress={() => setAgreedToTerms(!agreedToTerms)}
                      style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
                    >
                      {agreedToTerms ? <Icon name="checkmark" size="sm" tone="inverse" /> : null}
                    </Pressable>
                    <Text variant="caption" tone="secondary" style={styles.consentText}>
                      {t('auth.consentPrefix')}{' '}
                      <Text variant="caption" tone="link" style={styles.legalLink} onPress={() => handleOpenLegal('terms')}>
                        {t('auth.consentTerms')}
                      </Text>{' '}
                      {t('auth.consentAnd')}{' '}
                      <Text variant="caption" tone="link" style={styles.legalLink} onPress={() => handleOpenLegal('privacy')}>
                        {t('auth.consentPrivacy')}
                      </Text>
                      {t('auth.consentSuffix')}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.submitContainer}>
                  <Button
                    label={isLogin ? t('auth.tabSignIn') : t('auth.tabCreate')}
                    variant="primary"
                    fullWidth
                    onPress={handleSubmit}
                    disabled={loading}
                    loading={loading}
                  />
                </View>

                {/* Quick switch helper */}
                <Pressable
                  accessibilityRole="button"
                  style={styles.switchPrompt}
                  onPress={() => handleModeChange(isLogin ? 'signup' : 'login')}
                >
                  <Text variant="caption" tone="secondary" align="center">
                    {isLogin ? t('auth.modalNoAccountPrompt') : t('auth.modalRegisteredPrompt')}{' '}
                    <Text variant="caption" tone="link">
                      {isLogin ? t('auth.modalSignUpLink') : t('auth.tabSignIn')}
                    </Text>
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <LegalTermsModal
        visible={showLegalModal}
        initialTab={legalModalInitialTab}
        onClose={() => setShowLegalModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: color.text.primary,
    opacity: 0.45,
  },
  sheetLayer: {
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: color.bg.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: space.lg,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    maxHeight: '90%',
    ...elevation.sheet,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.xxs,
    paddingRight: space.sm,
  },
  modeSwitch: {
    marginBottom: space.md,
  },
  body: {
    paddingVertical: space.xs,
  },
  errorBanner: {
    backgroundColor: color.tone.danger.bg,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  submitContainer: {
    marginTop: space.sm,
    marginBottom: space.md,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginVertical: space.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: color.border.input,
    backgroundColor: color.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xxs,
  },
  checkboxChecked: {
    backgroundColor: color.action.primary,
    borderColor: color.action.primary,
  },
  consentText: {
    flex: 1,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
  switchPrompt: {
    alignItems: 'center',
    paddingVertical: space.sm,
    marginBottom: space.lg,
  },
});
