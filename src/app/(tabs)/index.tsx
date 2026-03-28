import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { MonthCalendar } from "@/components/month-calendar";
import {
    BottomTabInset,
    Colors,
    Spacing,
    Typography
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { DayPlanRepository } from "@/db/day-plan-repository";

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const planRepo = useMemo(() => new DayPlanRepository(db), [db]);
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [planDates, setPlanDates] = useState(new Set<string>());

  const loadData = useCallback(async () => {
    const dates = await planRepo.getAllDates();
    setPlanDates(new Set(dates));
  }, [planRepo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <Text style={styles.title}>{t.dashboard}</Text>
          <Text style={styles.subtitle}>{t.dashboardSubtitle}</Text>
        </View>

        <MonthCalendar markedDates={planDates} />
      </ScrollView>
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
});
