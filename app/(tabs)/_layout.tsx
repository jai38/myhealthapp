import React from 'react';
import { Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, typography } from '../../theme/index';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: 'rgba(7, 12, 24, 0.82)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any)
            : {}),
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { ...typography.h3, fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'web' ? 14 : 16,
          left: 14,
          right: 14,
          marginHorizontal: 'auto',
          maxWidth: 580,
          borderRadius: 28,
          backgroundColor: 'rgba(12, 18, 32, 0.82)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.14)',
          borderTopColor: 'rgba(255, 255, 255, 0.38)', // Specular light refraction rim
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
              } as any)
            : {}),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
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
