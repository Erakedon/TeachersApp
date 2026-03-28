import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icon";
import { MonthCalendar } from "@/components/month-calendar";
import {
    BottomTabInset,
    Colors,
    FontFamily,
    Radius,
    Spacing,
    Typography,
} from "@/constants/theme";

// ---------------------------------------------------------------------------
// Mock plan dates — replaced by SQLite queries in Stage 6
// ---------------------------------------------------------------------------
const MOCK_PLAN_DATES = new Set([
  "2026-03-10",
  "2026-03-15",
  "2026-03-18",
  "2026-03-24",
  "2026-03-28",
]);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 600;

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Organize your month and nurture curiosity with AI-guided lessons.
          </Text>
        </View>

        {/* Bento grid: calendar (left/top) + sidebar (right/bottom) */}
        <View style={[styles.bento, isWide && styles.bentoRow]}>
          <View
            style={[styles.calendarPane, isWide && styles.calendarPaneWide]}
          >
            <MonthCalendar markedDates={MOCK_PLAN_DATES} />
          </View>

          <View style={[styles.sidebar, isWide && styles.sidebarWide]}>
            <AssistantTipCard />
            <PendingTasksPanel />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Assistant tip card
// ---------------------------------------------------------------------------

function AssistantTipCard() {
  return (
    <View style={tipStyles.card}>
      <View style={tipStyles.headerRow}>
        <Icon name="lightbulb-outline" size={20} color={Colors.secondary} />
        <Text style={tipStyles.title}>Assistant Tip</Text>
      </View>
      <Text style={tipStyles.body}>
        Most students are curious about {'"'}Autumn Leaves{'"'} this week based
        on recent observations.
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pending tasks panel
// ---------------------------------------------------------------------------

function PendingTasksPanel() {
  return (
    <View style={tasksStyles.card}>
      <Text style={tasksStyles.heading}>Pending Tasks</Text>
      <TaskRow
        dotColor={Colors.error}
        text="Finalize sensory play materials for Thursday"
      />
      <TaskRow
        dotColor={Colors.secondary}
        text="Log afternoon snacks for Blue Group"
      />
    </View>
  );
}

function TaskRow({ dotColor, text }: { dotColor: string; text: string }) {
  return (
    <View style={tasksStyles.taskRow}>
      <View style={[tasksStyles.dot, { backgroundColor: dotColor }]} />
      <Text style={tasksStyles.taskText}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  pageHeader: {
    gap: Spacing.one,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
  },
  bento: {
    gap: Spacing.three,
  },
  bentoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  calendarPane: {},
  calendarPaneWide: {
    flex: 2,
  },
  sidebar: {
    gap: Spacing.three,
  },
  sidebarWide: {
    flex: 1,
  },
});

const tipStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSecondaryContainer,
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSecondaryContainer,
    opacity: 0.9,
  },
});

const tasksStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: Colors.onSurfaceVariant,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    marginTop: 5,
  },
  taskText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurface,
  },
});
