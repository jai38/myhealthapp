import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../design/components';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import { authService, UserSession } from '../../services/auth/auth-service';
import { AuthModal } from '../auth/AuthModal';
import { LegalTermsModal } from '../legal/LegalTermsModal';
import { GuestProfileCard, SignedInProfileCard } from './AccountProfileCard';
import { PrivacySection, SecuritySection } from './AccountInfoSections';
import { SignOutSection } from './AccountSignOutSection';

export interface AccountContentProps {
  // Change this to collapse the sign-out confirmation (the modal passes its visibility).
  resetKey?: unknown;
  // Called after a successful sign out.
  onSignedOut?: () => void;
}

export const AccountContent: React.FC<AccountContentProps> = ({ resetKey, onSignedOut }) => {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [authModalVisible, setAuthModalVisible] = useState<boolean>(false);
  const [legalModalVisible, setLegalModalVisible] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((currentSession) => {
      setSession(currentSession);
    });
    return unsubscribe;
  }, []);

  // Collapses the sign-out confirmation whenever the host hides or re-shows this content.
  useEffect(() => {
    setIsConfirmingSignOut(false);
  }, [resetKey]);

  const handleExecuteSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authService.logout();
      setSession(null);
      setIsConfirmingSignOut(false);
      onSignedOut?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('profile.signOutFailed');
      Alert.alert(t('profile.notice'), msg);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return t('profile.initialsFallback');
  };

  const detectedTimezone =
    typeof Intl !== 'undefined' && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : t('profile.localTimeFallback');

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        {session ? (
          <>
            <View style={styles.section}>
              <SignedInProfileCard
                initials={getInitials(session.fullName, session.email)}
                displayName={session.fullName || t('profile.verifiedFallbackName')}
                email={session.email}
              />
            </View>

            <SecuritySection timezone={detectedTimezone} />

            <PrivacySection
              onOpenLegal={(tab) => {
                setLegalModalTab(tab);
                setLegalModalVisible(true);
              }}
            />

            <SignOutSection
              isConfirmingSignOut={isConfirmingSignOut}
              isSigningOut={isSigningOut}
              onRequestSignOut={() => setIsConfirmingSignOut(true)}
              onCancelSignOut={() => setIsConfirmingSignOut(false)}
              onConfirmSignOut={handleExecuteSignOut}
            />

            {/* App Version Info */}
            <View style={styles.versionContainer}>
              <Text variant="caption" tone="tertiary">
                {t('profile.version', { version: '1.0.0' })}
              </Text>
              <Text variant="overline" tone="tertiary">
                {t('profile.versionSubtext')}
              </Text>
            </View>
          </>
        ) : (
          <GuestProfileCard onSignIn={() => setAuthModalVisible(true)} />
        )}
      </ScrollView>

      {/* Embedded Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={() => {
          setAuthModalVisible(false);
          setSession(authService.getSession());
        }}
      />

      {/* Embedded Legal & Privacy Modal */}
      <LegalTermsModal
        visible={legalModalVisible}
        initialTab={legalModalTab}
        onClose={() => setLegalModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: space.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    marginBottom: space.xl,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: space.lg,
    gap: space.xxs,
  },
});
