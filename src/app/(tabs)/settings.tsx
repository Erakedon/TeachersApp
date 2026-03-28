import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icon";
import {
    Colors,
    FontFamily,
    Radius,
    Spacing,
    Typography,
} from "@/constants/theme";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Ustawienia</Text>
          <Text style={styles.subtitle}>Informacje o aplikacji</Text>

          {/* AI status card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Icon name="auto-fix-high" size={20} color={Colors.primary} />
              <Text style={styles.statusTitle}>AI Gemini</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Aktywny</Text>
              </View>
            </View>
            <Text style={styles.statusBody}>
              Plany lekcji są generowane przez Google Gemini 2.0 Flash. Model
              odpowiada w ciągu kilku sekund.
            </Text>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyCard}>
            <Icon name="lock-outline" size={16} color={Colors.secondary} />
            <Text style={styles.privacyText}>
              Imiona dzieci nigdy nie są wysyłane do chmury. Przed każdym
              wywołaniem AI dane są anonimizowane na urządzeniu.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.two,
  },
  statusCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.outlineVariant,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  statusTitle: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  activeBadge: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primary,
  },
  statusBody: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  privacyText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSecondaryContainer,
  },
});
