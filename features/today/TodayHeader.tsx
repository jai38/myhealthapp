import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserSession } from '../../services/auth/auth-service';
import { styles } from './styles-header';

export function TodayHeader({
  session,
  formattedSelectedDate,
  onOpenAccount,
}: {
  session: UserSession | null;
  formattedSelectedDate: string;
  onOpenAccount: () => void;
}) {
  return (
    <>
      {/* 1. HEALTH OS HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.dateText}>{formattedSelectedDate}</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>⏱️ MEDICATION SCHEDULE</Text>
            </View>
          </View>
          <Text style={styles.greeting}>
            {session?.fullName ? `Hello, ${session.fullName.split(' ')[0]}` : 'Welcome Back'}
          </Text>
          <Text style={styles.subGreeting}>
            Keep your medications and health records on track today.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onOpenAccount}
          accessibilityLabel="Open Account Settings"
          activeOpacity={0.8}
        >
          <Text style={styles.avatarButtonText}>
            {session?.fullName
              ? session.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '👤'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
