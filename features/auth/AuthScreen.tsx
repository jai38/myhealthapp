import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/index';
import { authService, UserSession } from '../../services/auth/auth-service';

export interface AuthScreenProps {
  onSuccess?: (session: UserSession) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialMode = 'login',
}) => {
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
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
      Alert.alert('Authentication Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🩺</Text>
            </View>
            <Text style={styles.brandTitle}>MyHealth</Text>
            <Text style={styles.brandTagline}>Your Personal Clinical Health Vault</Text>
            <View style={styles.cloudBadge}>
              <View style={styles.cloudDot} />
              <Text style={styles.cloudText}>Connected to Render Cloud & Supabase</Text>
            </View>
          </View>

          {/* Card Container */}
          <View style={styles.authCard}>
            {/* Mode Switch Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.activeTab]}
                onPress={() => handleModeChange('login')}
                disabled={loading}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.activeTab]}
                onPress={() => handleModeChange('signup')}
                disabled={loading}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formHeader}>
              <Text style={typography.h3}>
                {mode === 'login' ? 'Welcome Back' : 'Get Started'}
              </Text>
              <Text style={[typography.bodyMuted, { marginTop: 4 }]}>
                {mode === 'login'
                  ? 'Access your prescriptions, medications, and health history.'
                  : 'Create a private account with encrypted cloud backup.'}
              </Text>
            </View>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
            )}

            <Input
              label="Email Address"
              placeholder="patient@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Input
              label="Password"
              placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              helperText={
                mode === 'signup'
                  ? 'Use at least 8 characters with letters and numbers'
                  : undefined
              }
              editable={!loading}
            />

            <View style={styles.actionContainer}>
              <Button
                title={
                  loading
                    ? 'Connecting...'
                    : mode === 'login'
                    ? 'Sign In to MyHealth'
                    : 'Create MyHealth Account'
                }
                variant="primary"
                onPress={handleSubmit}
                disabled={loading}
              />
              {loading && (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>

            {/* Quick Switch Prompt */}
            <TouchableOpacity
              style={styles.switchPrompt}
              onPress={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
            >
              <Text style={typography.caption}>
                {mode === 'login'
                  ? "Don't have an account yet? "
                  : 'Already have an account? '}
                <Text style={styles.switchPromptLink}>
                  {mode === 'login' ? 'Create Account' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy & Trust Footer */}
          <View style={styles.trustFooter}>
            <Text style={styles.trustText}>
              🔒 Protected Health Information is encrypted with AES-256 and stored in private S3 buckets. We never share your records.
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  brandTagline: {
    ...typography.bodyMuted,
    marginTop: 4,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  cloudDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  cloudText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.lg,
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
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: spacing.md,
  },
  switchPrompt: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  switchPromptLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  trustFooter: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  trustText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
