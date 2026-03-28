import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Colors, FontFamily, Spacing, Typography } from '@/constants/theme';

/**
 * Special Requirements (Profiles) tab — placeholder screen for Stage 2.
 * Real content (GDPR banner, child profile cards, add-profile form)
 * is built in Stage 4.
 */
export default function ProfilesScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <Text style={styles.overline}>Care Management</Text>
        <Text style={styles.title}>Special Requirements</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Child profiles & GDPR compliance — Stage 4</Text>
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
    gap: Spacing.one,
  },
  overline: {
    ...Typography.overline,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.one,
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
