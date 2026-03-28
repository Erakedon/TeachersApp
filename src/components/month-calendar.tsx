import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Radius, Spacing } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthCalendarProps {
  markedDates?: Set<string>; // YYYY-MM-DD strings — days that have a saved plan
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Polish-convention Monday-first day headers */
const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns 42 CalendarDay entries (6 rows × 7 cols) starting on the Monday
 * that falls within or before the first day of the given month.
 */
function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const dow = firstDayOfMonth.getDay(); // 0 = Sunday
  // Monday-first: Sunday → go back 6; Mon(1) → 0; Tue(2) → 1 …
  const startOffset = dow === 0 ? 6 : dow - 1;

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    days.push({
      date: d,
      dateStr: toDateStr(d),
      isCurrentMonth: d.getMonth() === month,
    });
  }
  return days;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MonthCalendar({
  markedDates = new Set<string>(),
}: MonthCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const todayStr = toDateStr(today);

  const [displayDate, setDisplayDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const days = getCalendarDays(year, month);

  return (
    <View style={styles.card}>
      {/* Month / year title + prev/next navigation */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <View style={styles.navRow}>
          <Pressable
            onPress={() => setDisplayDate(new Date(year, month - 1, 1))}
            style={({ pressed }) => [
              styles.navBtn,
              pressed && styles.navBtnPressed,
            ]}
            hitSlop={8}
            accessibilityLabel="Previous month"
          >
            <Icon
              name="chevron-left"
              size={22}
              color={Colors.onSurfaceVariant}
            />
          </Pressable>
          <Pressable
            onPress={() => setDisplayDate(new Date(year, month + 1, 1))}
            style={({ pressed }) => [
              styles.navBtn,
              pressed && styles.navBtnPressed,
            ]}
            hitSlop={8}
            accessibilityLabel="Next month"
          >
            <Icon
              name="chevron-right"
              size={22}
              color={Colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>

      {/* Day-of-week header row */}
      <View style={styles.dayHeaderRow}>
        {DAY_HEADERS.map((h) => (
          <Text key={h} style={styles.dayHeader}>
            {h}
          </Text>
        ))}
      </View>

      {/* Calendar grid — 7 columns, 6 rows */}
      <View style={styles.grid}>
        {days.map(({ date, dateStr, isCurrentMonth }) => {
          const isToday = dateStr === todayStr;
          const hasPlan = markedDates.has(dateStr);

          return (
            <Pressable
              key={dateStr}
              style={styles.cell}
              onPress={
                isCurrentMonth
                  ? () => router.push(`/day-plan/${dateStr}`)
                  : undefined
              }
              accessibilityRole="button"
              accessibilityLabel={`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}${hasPlan ? ", has lesson plan" : ""}`}
            >
              <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                <Text
                  style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.dayFaded,
                    isToday && styles.todayNumber,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {/* Reserve the dot row height even when empty for consistent cell height */}
              <View style={styles.dotRow}>
                {hasPlan && isCurrentMonth && <View style={styles.dot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CELL_PCT = `${100 / 7}%` as `${number}%`;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  monthTitle: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.primary,
  },
  navRow: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: Spacing.two,
  },
  dayHeader: {
    width: CELL_PCT,
    textAlign: "center",
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: CELL_PCT,
    alignItems: "center",
    paddingVertical: Spacing.one,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  todayCircle: {
    backgroundColor: Colors.primary,
  },
  dayNumber: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  dayFaded: {
    color: Colors.outlineVariant,
  },
  todayNumber: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onPrimary,
  },
  dotRow: {
    height: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
});
