import React from 'react';
import { Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, typography } from '../../theme/index';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0C1220',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { ...typography.h3, fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#0C1220',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 64 : 60,
          paddingBottom: Platform.OS === 'web' ? 8 : 6,
          paddingTop: 6,
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pulse',
          headerTitle: 'Health Pulse',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>⚡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          headerTitle: 'Activity Stream',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Regimens',
          headerTitle: 'Medications & Routine',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>💊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Vault',
          headerTitle: 'Health Record Vault',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>🛡️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
