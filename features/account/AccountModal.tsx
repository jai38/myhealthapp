import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/index';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { authService, UserSession } from '../../services/auth/auth-service';
import { AuthModal } from '../auth/AuthModal';

export interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ visible, onClose }) => {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [authModalVisible, setAuthModalVisible] = useState<boolean>(false);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((currentSession) => {
      setSession(currentSession);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!visible) {
      setIsConfirmingSignOut(false);
    }
  }, [visible]);

  const handleExecuteSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authService.logout();
      setSession(null);
      setIsConfirmingSignOut(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      Alert.alert('Notice', msg);
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
    return 'PT';
  };

  const detectedTimezone =
    typeof Intl !== 'undefined' && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Local System Time';

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Patient Account</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {session ? (
              <>
                {/* Profile Avatar Card */}
                <Card style={styles.profileCard}>
                  <View style={styles.avatarRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(session.fullName, session.email)}
                      </Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.patientName}>
                        {session.fullName || 'Verified Patient'}
                      </Text>
                      <Text style={styles.patientEmail}>{session.email}</Text>
                      <View style={{ marginTop: spacing.xs }}>
                        <Badge label="Verified Patient Account" variant="success" />
                      </View>
                    </View>
                  </View>
                </Card>

                {/* Cloud & Security Card */}
                <Card style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={typography.h3}>Security & Data Protection</Text>
                    <Badge label="Active" variant="info" />
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureIcon}>🔒</Text>
                    <View style={styles.featureTextCol}>
                      <Text style={styles.featureTitle}>End-to-End Encrypted Storage</Text>
                      <Text style={styles.featureSubtitle}>
                        Your uploaded prescriptions, lab reports, and extracted clinical records are tenant-isolated and encrypted.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureRow}>
                    <Text style={styles.featureIcon}>🌐</Text>
                    <View style={styles.featureTextCol}>
                      <Text style={styles.featureTitle}>Synchronized Health Zone</Text>
                      <Text style={styles.featureSubtitle}>
                        Detected Timezone: {detectedTimezone}. Reminders are automatically scheduled in your local clock time.
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Account Actions */}
                <Card style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={typography.h3}>Account Management</Text>
                  </View>
                  <Text style={[typography.bodyMuted, { marginBottom: spacing.md }]}>
                    Signing out will clear local session credentials from this device. All verified health records remain securely stored.
                  </Text>

                  {isConfirmingSignOut ? (
                    <View style={styles.confirmBox}>
                      <Text style={styles.confirmTitle}>Confirm Sign Out</Text>
                      <Text style={styles.confirmDescription}>
                        Are you sure you want to sign out from this device? Your records are safely saved on the cloud.
                      </Text>
                      <View style={styles.confirmButtonRow}>
                        <TouchableOpacity
                          style={[styles.confirmBtn, styles.cancelBtn]}
                          onPress={() => setIsConfirmingSignOut(false)}
                          disabled={isSigningOut}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.confirmBtn, styles.signOutBtn]}
                          onPress={handleExecuteSignOut}
                          disabled={isSigningOut}
                        >
                          {isSigningOut ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Text style={styles.signOutBtnText}>Yes, Sign Out</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Button
                      title="Sign Out of MyHealth"
                      variant="outline"
                      onPress={() => setIsConfirmingSignOut(true)}
                    />
                  )}
                </Card>

                {/* App Version Info */}
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>MyHealth App v1.0.0 • Clinical Edition</Text>
                  <Text style={styles.versionSubtext}>Strict Clinical Safety & FHIR Aligned</Text>
                </View>
              </>
            ) : (
              <Card style={styles.profileCard}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.avatarText, { color: colors.textSecondary }]}>👤</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.patientName}>Guest Patient</Text>
                    <Text style={styles.patientEmail}>Local Device Only</Text>
                    <View style={{ marginTop: spacing.xs }}>
                      <Badge label="Unlinked Account" variant="neutral" />
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: spacing.md }}>
                  <Text style={[typography.bodyMuted, { marginBottom: spacing.md }]}>
                    Sign in to sync your verified medical history, export doctor-ready PDF summaries, and access your records securely across devices.
                  </Text>
                  <Button
                    title="Sign In or Register"
                    variant="primary"
                    onPress={() => setAuthModalVisible(true)}
                  />
                </View>
              </Card>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Embedded Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={() => {
          setAuthModalVisible(false);
          setSession(authService.getSession());
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 17,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  profileCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  patientName: {
    ...typography.h2,
    fontSize: 18,
  },
  patientEmail: {
    ...typography.bodyMuted,
    fontSize: 14,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  featureSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  versionSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  confirmBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.35)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  confirmTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  confirmDescription: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  signOutBtn: {
    backgroundColor: colors.danger,
  },
  signOutBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
