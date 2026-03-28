import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Colors, FontFamily, Spacing, Typography } from '@/constants/theme';

/**
 * Dashboard tab — placeholder screen for Stage 2.
 * Real content (interactive calendar, assistant tip card,
 * pending tasks panel) is built in Stage 3.
 */
export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Organize your month and nurture curiosity with AI-guided lessons.
        </Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Calendar & lesson planner — Stage 3</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
  },
  placeholder: {
    flex: 1,
    marginTop: Spacing.four,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
