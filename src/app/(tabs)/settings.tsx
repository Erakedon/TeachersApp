import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { useLanguage, type Language } from "@/contexts/language-context";

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <AppHeader />
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t.settings}</Text>
          <Text style={styles.subtitle}>{t.appInfo}</Text>

          {/* Language picker card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Icon name="language" size={20} color={Colors.primary} />
              <Text style={styles.statusTitle}>{t.language}</Text>
            </View>
            <Text style={styles.langLabel}>{t.languageLabel}</Text>
            <View style={styles.langPillRow}>
              {(["pl", "en"] as Language[]).map((lang) => (
                <Pressable
                  key={lang}
                  style={({ pressed }) => [
                    styles.langPill,
                    language === lang && styles.langPillActive,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === lang }}
                >
                  <Text
                    style={[
                      styles.langPillLabel,
                      language === lang && styles.langPillLabelActive,
                    ]}
                  >
                    {lang === "pl" ? "🇵🇱  Polski" : "🇬🇧  English"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* AI status card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Icon name="auto-fix-high" size={20} color={Colors.primary} />
              <Text style={styles.statusTitle}>{t.aiStatus}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t.aiActive}</Text>
              </View>
            </View>
            <Text style={styles.statusBody}>{t.aiStatusBody}</Text>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyCard}>
            <Icon name="lock-outline" size={16} color={Colors.secondary} />
            <Text style={styles.privacyText}>{t.privacyNote}</Text>
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
  langLabel: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  langPillRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  langPill: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: "center",
  },
  langPillActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  langPillLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  langPillLabelActive: {
    color: Colors.primary,
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
