import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/index';
import { authService, UserSession } from '../../services/auth/auth-service';
import { LegalTermsModal } from '../legal/LegalTermsModal';

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
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (mode === 'signup' && !agreedToTerms) {
      setErrorMessage('You must review and agree to the Terms of Service & Health Privacy Policy before creating an account.');
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
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={typography.h2}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={[typography.bodyMuted, { marginTop: 2 }]}>
                {mode === 'login'
                  ? 'Sign in to access your secure medical records'
                  : 'Get started with personal medical timeline tracking'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => handleModeChange('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.activeTab]}
              onPress={() => handleModeChange('signup')}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {mode === 'signup' ? (
              <Input
                label="Full Name"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            ) : null}

            <Input
              label="Email Address"
              placeholder="patient@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              helperText={
                mode === 'signup'
                  ? 'Use at least 8 characters with letters and numbers'
                  : undefined
              }
            />

            {mode === 'signup' ? (
              <View style={styles.consentContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agreedToTerms }}
                >
                  {agreedToTerms ? <Text style={styles.checkmark}>✓</Text> : null}
                </TouchableOpacity>
                <View style={styles.consentTextContainer}>
                  <Text style={styles.consentText}>
                    I have read and agree to the{' '}
                    <Text
                      style={styles.legalLink}
                      onPress={() => handleOpenLegal('terms')}
                    >
                      Terms of Service
                    </Text>{' '}
                    and acknowledge the{' '}
                    <Text
                      style={styles.legalLink}
                      onPress={() => handleOpenLegal('privacy')}
                    >
                      Health Privacy Policy
                    </Text>
                    , including secure AI prescription extraction.
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.submitContainer}>
              <Button
                title={mode === 'login' ? 'Sign In' : 'Create Account'}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
              />
              {loading ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
            </View>

            {/* Quick Switch Helper */}
            <TouchableOpacity
              style={styles.switchPrompt}
              onPress={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
            >
              <Text style={typography.caption}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already registered? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    fontWeight: '700',
    color: colors.primary,
  },
  body: {
    paddingVertical: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  submitButton: {
    width: '100%',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  switchPrompt: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
});
