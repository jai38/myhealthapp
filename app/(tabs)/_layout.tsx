import React from 'react';
import { Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, typography } from '../../theme/index';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              } as any)
            : {}),
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { ...typography.h3, fontSize: 17, color: colors.textPrimary, fontWeight: '700' },
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
          backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.92)' : '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.07)',
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#111418',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 14px 40px rgba(17, 20, 24, 0.08), 0 2px 10px rgba(17, 20, 24, 0.04)',
              } as any)
            : {}),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
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
          title: 'Today',
          headerTitle: 'MyHealth',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>🗓️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          headerTitle: 'Health Timeline',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medications',
          headerTitle: 'Medications & Routine',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>💊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Records',
          headerTitle: 'Medical Records',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>📄</Text>
          ),
        }}
      />
    </Tabs>
  );
}
