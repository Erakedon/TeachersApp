import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Colors, FontFamily, Spacing, Typography } from '@/constants/theme';

/**
 * Settings tab — placeholder screen for Stage 2.
 * Real content (language toggle, API key, preferences, GDPR info)
 * is built in Stage 10.
 */
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Language, API key, preferences — Stage 10</Text>
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
