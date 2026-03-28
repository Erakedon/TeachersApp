import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Radius, Spacing, Typography } from "@/constants/theme";

type ViewState = "unplanned" | "generating" | "planned";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Autumn";
  return "Winter";
}

function getUpcomingHoliday(): string | null {
  const now = new Date();
  const year = now.getFullYear();
  const holidays: [string, Date][] = [
    ["New Year", new Date(year, 0, 1)],
    ["Easter", new Date(year, 3, 5)],
    ["Labour Day", new Date(year, 4, 1)],
    ["Constitution Day", new Date(year, 4, 3)],
    ["Assumption", new Date(year, 7, 15)],
    ["All Saints", new Date(year, 10, 1)],
    ["Independence Day", new Date(year, 10, 11)],
    ["Christmas", new Date(year, 11, 25)],
  ];
  const upcoming = holidays
    .filter(([, d]) => {
      const diff = d.getTime() - now.getTime();
      return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000;
    })
    .sort(([, a], [, b]) => a.getTime() - b.getTime());
  return upcoming.length > 0 ? upcoming[0][0] : null;
}

export default function DayPlanScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const dateStr = Array.isArray(date) ? date[0] : date ?? "";
  const formattedDate = dateStr ? formatDate(dateStr) : "";

  const [viewState, setViewState] = useState<ViewState>("unplanned");
  const [topic, setTopic] = useState("");

  const season = getCurrentSeason();
  const holiday = getUpcomingHoliday();
  const activeProfileCount = 3;

  const handleGenerate = useCallback(() => {
    setViewState("generating");
    setTimeout(() => setViewState("planned"), 2000);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView edges={["top"]} style={styles.bar}>
        <View style={styles.barRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Icon name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <View style={styles.barText}>
            <Text style={styles.overline}>Lesson Crafting</Text>
            <Text style={styles.dateLabel}>{formattedDate}</Text>
          </View>
        </View>
      </SafeAreaView>

      {viewState === "planned" ? (
        <PlannedPlaceholder onBack={() => setViewState("unplanned")} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.noplanHint}>No plan created yet</Text>

          <View style={styles.topicCard}>
            <Text style={styles.topicLabel}>Topic of the Day</Text>
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="Enter a theme (optional)"
              placeholderTextColor={Colors.outlineVariant}
              multiline
              maxLength={120}
              accessibilityLabel="Topic of the day"
            />
            <Text style={styles.charCount}>{topic.length}/120</Text>

            <Pressable
              style={({ pressed }) => [
                styles.generateBtn,
                pressed && styles.generateBtnPressed,
                viewState === "generating" && styles.generateBtnLoading,
              ]}
              onPress={handleGenerate}
              disabled={viewState === "generating"}
              accessibilityRole="button"
              accessibilityLabel="Generate lesson plan"
            >
              {viewState === "generating" ? (
                <>
                  <ActivityIndicator color={Colors.onPrimary} size="small" />
                  <Text style={styles.generateBtnLabel}>Generating...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.generateBtnLabel}>Generate Lesson Plan</Text>
                  <Icon name="auto-fix-high" size={20} color={Colors.onPrimary} />
                </>
              )}
            </Pressable>
          </View>

          <ContextSummaryCard
            season={season}
            holiday={holiday}
            activeProfileCount={activeProfileCount}
          />

          <View style={styles.tipCard}>
            <Icon name="lightbulb-outline" size={20} color={Colors.tertiaryDim} />
            <Text style={styles.tipText}>
              Pro tip: Mentioning specific classroom materials helps the AI create more relevant activities.
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

interface ContextSummaryCardProps {
  season: string;
  holiday: string | null;
  activeProfileCount: number;
}

function ContextSummaryCard({ season, holiday, activeProfileCount }: ContextSummaryCardProps) {
  return (
    <View style={ctxStyles.card}>
      <View style={ctxStyles.headerRow}>
        <Icon name="info-outline" size={18} color={Colors.secondary} />
        <Text style={ctxStyles.title}>What the AI will consider</Text>
      </View>
      <View style={ctxStyles.chipRow}>
        <ContextChip icon="wb-sunny" label={"Season: " + season} />
        {holiday && <ContextChip icon="celebration" label={"Upcoming: " + holiday} />}
        <ContextChip
          icon="child-care"
          label={activeProfileCount + " active special-needs profile" + (activeProfileCount !== 1 ? "s" : "")}
        />
      </View>
    </View>
  );
}

function ContextChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={ctxStyles.chip}>
      <Icon name={icon as any} size={14} color={Colors.secondary} />
      <Text style={ctxStyles.chipLabel}>{label}</Text>
    </View>
  );
}

function PlannedPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={planStyles.root} edges={["bottom", "left", "right"]}>
      <View style={planStyles.inner}>
        <Icon name="check-circle-outline" size={56} color={Colors.primary} />
        <Text style={planStyles.title}>Plan Generated!</Text>
        <Text style={planStyles.body}>
          The full lesson plan view is coming in Stage 9.
        </Text>
        <Pressable
          style={({ pressed }) => [planStyles.btn, pressed && { opacity: 0.7 }]}
          onPress={onBack}
          accessibilityRole="button"
        >
          <Text style={planStyles.btnLabel}>Back to unplanned view</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  bar: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  barText: {
    flex: 1,
    gap: 2,
  },
  overline: {
    ...Typography.overline,
    color: Colors.primary,
  },
  dateLabel: {
    ...Typography.headlineLarge,
    color: Colors.onSurface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  noplanHint: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  topicCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: "#2f3334",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  topicLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: Colors.primary,
  },
  topicInput: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 56,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.outlineVariant,
    textAlign: "right",
  },
  generateBtn: {
    marginTop: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three + 4,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  generateBtnPressed: {
    opacity: 0.85,
  },
  generateBtnLoading: {
    opacity: 0.75,
  },
  generateBtnLabel: {
    fontFamily: FontFamily.headline,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onPrimary,
  },
  tipCard: {
    backgroundColor: Colors.tertiaryFixedDim,
    borderRadius: Radius.md,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onTertiaryFixedVariant,
    fontStyle: "italic",
  },
});

const ctxStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  title: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  chipLabel: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
});

const planStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.primary,
    textAlign: "center",
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
  },
  btn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  btnLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
});