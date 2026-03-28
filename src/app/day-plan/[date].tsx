import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Spacing, Typography } from "@/constants/theme";

/**
 * Day Plan screen — pushed on the root Stack when the teacher taps
 * a calendar day on the Dashboard.
 *
 * This is a placeholder for Stage 2. Full content:
 *  - Unplanned view (topic input, Generate CTA) → Stage 5
 *  - Planned view (activity timeline, accordions) → Stage 9
 */
export default function DayPlanScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  const formattedDate = React.useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date]);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.back()}
            accessibilityLabel="Go back to dashboard"
            accessibilityRole="button"
          >
            <Icon name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.subtitle}>Lesson Plan</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Content area */}
      <SafeAreaView style={styles.content} edges={["bottom", "left", "right"]}>
        <View style={styles.placeholder}>
          <Icon name="auto-fix-high" size={40} color={Colors.primary} />
          <Text style={styles.placeholderTitle}>No plan yet</Text>
          <Text style={styles.placeholderText}>
            Generate flow (Stage 5) and planned view (Stage 9) coming soon.
          </Text>
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
  headerSafe: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  dateText: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  placeholder: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  placeholderTitle: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
  },
  placeholderText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
  },
});
