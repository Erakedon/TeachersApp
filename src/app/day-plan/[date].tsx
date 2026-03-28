/**
 * Day Plan screen — Stage 8
 *
 * Full AI generation pipeline:
 *   1. Load active child profiles from SQLite
 *   2. On-device LLM (useLLM / QWEN3) scrubs PII → AnonymizedContext
 *      Falls back to rule-based scrubber if model not yet ready
 *   3. Gemini REST API generates a structured lesson plan (no real names)
 *   4. PrivacyRemapper re-inserts real names client-side
 *   5. Save to DayPlanRepository
 *   6. Display in planned view (full card UI coming in Stage 9)
 *
 * Security: API key lives only in expo-secure-store. No PII leaves the device.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { QWEN3_0_6B_QUANTIZED, useLLM } from "react-native-executorch";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import {
  BottomTabInset,
  Colors,
  FontFamily,
  Radius,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { ChildProfileRepository } from "@/db/child-profile-repository";
import { DayPlanRepository } from "@/db/day-plan-repository";
import { getGeminiApiKey } from "@/services/api-key-store";
import { GeminiService } from "@/services/gemini-service";
import { remapLessonPlan } from "@/services/privacy-remapper";
import { rulesBasedScrub } from "@/services/rule-based-anonymizer";
import type { Activity, ChildProfile, LessonPlan } from "@/types";

type ViewState = "unplanned" | "generating" | "planned" | "error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid TZ day-shift
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type SeasonKey =
  | "seasonSpring"
  | "seasonSummer"
  | "seasonAutumn"
  | "seasonWinter";

function getCurrentSeasonKey(): SeasonKey {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "seasonSpring";
  if (month >= 6 && month <= 8) return "seasonSummer";
  if (month >= 9 && month <= 11) return "seasonAutumn";
  return "seasonWinter";
}

function getUpcomingHoliday(): string | null {
  const now = new Date();
  const year = now.getFullYear();
  const holidays: [string, Date][] = [
    ["Nowy Rok", new Date(year, 0, 1)],
    ["Wielkanoc", new Date(year, 3, 5)],
    ["Święto Pracy", new Date(year, 4, 1)],
    ["Święto Konstytucji", new Date(year, 4, 3)],
    ["Wniebowzięcie NMP", new Date(year, 7, 15)],
    ["Wszystkich Świętych", new Date(year, 10, 1)],
    ["Święto Niepodległości", new Date(year, 10, 11)],
    ["Boże Narodzenie", new Date(year, 11, 25)],
  ];
  const upcoming = holidays
    .filter(([, d]) => {
      const diff = d.getTime() - now.getTime();
      return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000;
    })
    .sort(([, a], [, b]) => a.getTime() - b.getTime());
  return upcoming.length > 0 ? upcoming[0][0] : null;
}

// ---------------------------------------------------------------------------
// LLM system prompt for on-device PII scrubbing
// ---------------------------------------------------------------------------

const SCRUB_SYSTEM_PROMPT = `You are a privacy assistant. Your ONLY job is to anonymize child profiles.
Respond with ONLY a JSON object — no explanation, no markdown, no code fences.

Given an array of profiles with "name" and "conditionDescription" fields, assign each child
a sequential anonymous key (Child_A, Child_B, …) and output:
{"tags":["[Child_A: <conditionDescription>]"],"mapping":{"Child_A":"real name"}}`;

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function DayPlanScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const dateStr = Array.isArray(date) ? date[0] : (date ?? "");
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-GB" : "pl-PL";
  const formattedDate = dateStr ? formatDate(dateStr, dateLocale) : "";

  const db = useSQLiteContext();
  const profileRepo = useMemo(() => new ChildProfileRepository(db), [db]);
  const planRepo = useMemo(() => new DayPlanRepository(db), [db]);

  const [viewState, setViewState] = useState<ViewState>("unplanned");
  const [topic, setTopic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);

  const seasonKey = getCurrentSeasonKey();
  const season = t[seasonKey];
  const holiday = getUpcomingHoliday();

  // Load active profiles on mount
  useEffect(() => {
    profileRepo
      .getActiveProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, [profileRepo]);

  // Restore saved plan on mount
  useEffect(() => {
    if (!dateStr) return;
    planRepo
      .getByDate(dateStr)
      .then((saved) => {
        if (saved?.rawJson) {
          try {
            const parsed = JSON.parse(saved.rawJson) as LessonPlan;
            setPlan(parsed);
            setViewState("planned");
          } catch {
            // corrupted row — stay on unplanned
          }
        }
      })
      .catch(() => {});
  }, [dateStr, planRepo]);

  // ── On-device LLM for PII scrubbing ──────────────────────────────────────
  // useLLM is safe inside a route screen — it is isolated from the navigation
  // tree and only mounts when this screen is navigated to.
  const llm = useLLM({
    model: QWEN3_0_6B_QUANTIZED,
    preventLoad: true, // only download when user taps Generate
  });
  const llmRef = useRef(llm);
  llmRef.current = llm;
  const llmConfiguredRef = useRef(false);

  useEffect(() => {
    if (llm.isReady && !llmConfiguredRef.current) {
      llmConfiguredRef.current = true;
      llm.configure({
        chatConfig: { systemPrompt: SCRUB_SYSTEM_PROMPT },
        generationConfig: { temperature: 0.1 },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llm.isReady]);

  // ── Generation pipeline ───────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setViewState("generating");
    setErrorMsg("");

    try {
      // Step 1: Get API key (bundled via EXPO_PUBLIC_GEMINI_API_KEY)
      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        throw new Error(t.apiKeyMissing);
      }

      // Step 2: Scrub PII on-device (LLM or rule-based fallback)
      const current = llmRef.current;
      let anonymized = rulesBasedScrub(profiles);

      if (current.isReady && llmConfiguredRef.current) {
        try {
          const inputJson = JSON.stringify(
            profiles.map((p) => ({
              name: p.name,
              conditionDescription: p.conditionDescription,
            })),
          );
          const llmResponse = await current.sendMessage(
            `Anonymize these profiles: ${inputJson}`,
          );
          const cleaned = llmResponse.replace(/```[a-z]*\n?/g, "").trim();
          const parsed = JSON.parse(cleaned) as {
            tags: string[];
            mapping: Record<string, string>;
          };
          if (
            Array.isArray(parsed.tags) &&
            typeof parsed.mapping === "object"
          ) {
            anonymized = {
              privacyMap: { tags: parsed.tags, mapping: parsed.mapping },
              tagSummary: parsed.tags.join(", "),
            };
          }
        } catch {
          // LLM parse failed — retain rule-based result
        }
      }

      // Step 3: Generate plan via Gemini (no PII in request)
      const gemini = new GeminiService(apiKey);
      let lessonPlan = await gemini.generateLessonPlan({
        date: dateStr,
        topic: topic.trim() || undefined,
        season,
        tagSummary: anonymized.tagSummary,
        privacyMap: anonymized.privacyMap,
        languageInstruction: t.aiLanguageInstruction,
      });

      // Step 4: Re-insert real names client-side
      lessonPlan = remapLessonPlan(lessonPlan, anonymized.privacyMap);

      // Step 5: Save to local DB
      await planRepo.save({
        id: `${dateStr}-${Date.now()}`,
        date: dateStr,
        topic: lessonPlan.suggestedTopic,
        rawJson: JSON.stringify(lessonPlan),
        createdAt: new Date().toISOString(),
      });

      setPlan(lessonPlan);
      setViewState("planned");
    } catch (err) {
      setErrorMsg((err as Error).message ?? "Nieznany błąd");
      setViewState("error");
    }
  }, [profiles, topic, dateStr, season, planRepo]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Top bar */}
      <SafeAreaView edges={["top"]} style={styles.bar}>
        <View style={styles.barRow}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Icon name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <View style={styles.barText}>
            <Text style={styles.overline}>
              {viewState === "planned" ? t.planHeader : t.createLesson}
            </Text>
            <Text style={styles.dateLabel}>{formattedDate}</Text>
          </View>
        </View>
      </SafeAreaView>

      {viewState === "planned" && plan ? (
        <PlannedView
          plan={plan}
          formattedDate={formattedDate}
          onDelete={async () => {
            await planRepo.delete(dateStr);
            setPlan(null);
            setViewState("unplanned");
          }}
        />
      ) : viewState === "generating" ? (
        <SkeletonView />
      ) : viewState === "error" ? (
        <ErrorView
          message={errorMsg}
          onRetry={handleGenerate}
          onBack={() => setViewState("unplanned")}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.noplanHint}>{t.noPlan}</Text>

          {/* LLM download progress */}
          {llm.downloadProgress > 0 && llm.downloadProgress < 1 && (
            <LLMDownloadBanner progress={llm.downloadProgress} />
          )}

          <View style={styles.topicCard}>
            <Text style={styles.topicLabel}>{t.dayTopic}</Text>
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder={t.topicPlaceholder}
              placeholderTextColor={Colors.outlineVariant}
              multiline
              maxLength={120}
              accessibilityLabel={t.dayTopic}
            />
            <Text style={styles.charCount}>{topic.length}/120</Text>

            <Pressable
              style={({ pressed }) => [
                styles.generateBtn,
                pressed && styles.generateBtnPressed,
              ]}
              onPress={handleGenerate}
              accessibilityRole="button"
              accessibilityLabel={t.generatePlan}
            >
              <Text style={styles.generateBtnLabel}>{t.generatePlan}</Text>
              <Icon name="auto-fix-high" size={20} color={Colors.onPrimary} />
            </Pressable>
          </View>

          <ContextSummaryCard
            season={season}
            holiday={holiday}
            activeProfileCount={profiles.length}
          />

          <View style={styles.tipCard}>
            <Icon
              name="lightbulb-outline"
              size={20}
              color={Colors.tertiaryDim}
            />
            <Text style={styles.tipText}>{t.tipBody}</Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LLMDownloadBanner({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  const { t } = useLanguage();
  return (
    <View style={llmStyles.banner}>
      <Text style={llmStyles.label}>
        {t.downloadingModel} ({pct}%)…
      </Text>
      <View style={llmStyles.track}>
        <View style={[llmStyles.fill, { width: `${pct}%` as `${number}%` }]} />
      </View>
    </View>
  );
}

interface ContextSummaryCardProps {
  season: string;
  holiday: string | null;
  activeProfileCount: number;
}

function ContextSummaryCard({
  season,
  holiday,
  activeProfileCount,
}: ContextSummaryCardProps) {
  const { t } = useLanguage();
  return (
    <View style={ctxStyles.card}>
      <View style={ctxStyles.headerRow}>
        <Icon name="info-outline" size={18} color={Colors.secondary} />
        <Text style={ctxStyles.title}>{t.aiConsiders}</Text>
      </View>
      <View style={ctxStyles.chipRow}>
        <ContextChip icon="wb-sunny" label={t.season + ": " + season} />
        {holiday && (
          <ContextChip icon="celebration" label={t.upcoming + ": " + holiday} />
        )}
        <ContextChip
          icon="child-care"
          label={
            activeProfileCount > 0
              ? t.activeProfiles(activeProfileCount)
              : t.noSpecialProfiles
          }
        />
      </View>
    </View>
  );
}

function ContextChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={ctxStyles.chip}>
      <Icon name={icon as never} size={14} color={Colors.secondary} />
      <Text style={ctxStyles.chipLabel}>{label}</Text>
    </View>
  );
}

function PlannedView({
  plan,
  formattedDate,
  onDelete,
}: {
  plan: LessonPlan;
  formattedDate: string;
  onDelete: () => void;
}) {
  const { t } = useLanguage();

  const sortedActivities = useMemo(
    () =>
      [...plan.activities].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
    [plan.activities],
  );

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={planHeaderStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan topic header */}
        <View style={planHeaderStyles.header}>
          <Text style={planHeaderStyles.overline}>{formattedDate}</Text>
          <Text style={planHeaderStyles.topic}>{plan.suggestedTopic}</Text>
          <View style={planHeaderStyles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                planHeaderStyles.actionBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel={t.share}
            >
              <Icon name="share" size={16} color={Colors.secondary} />
              <Text style={planHeaderStyles.actionBtnLabel}>{t.share}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                planHeaderStyles.actionBtn,
                planHeaderStyles.deleteBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() =>
                Alert.alert(t.deletePlan, t.deletePlanConfirm, [
                  { text: t.cancel, style: "cancel" },
                  { text: t.delete, style: "destructive", onPress: onDelete },
                ])
              }
              accessibilityRole="button"
              accessibilityLabel={t.deletePlan}
            >
              <Icon name="delete-outline" size={16} color={Colors.onError} />
              <Text
                style={[
                  planHeaderStyles.actionBtnLabel,
                  planHeaderStyles.deleteBtnLabel,
                ]}
              >
                {t.deletePlan}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Activity timeline */}
        <View style={timelineStyles.container}>
          {sortedActivities.map((activity, idx) => (
            <ActivityCard
              key={idx}
              activity={activity}
              isLast={idx === sortedActivities.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function ErrorView({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={errStyles.root}>
      <Icon name="error-outline" size={48} color={Colors.error} />
      <Text style={errStyles.title}>{t.planError}</Text>
      <Text style={errStyles.message}>{message}</Text>
      <Pressable
        style={errStyles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Text style={errStyles.retryLabel}>{t.retry}</Text>
      </Pressable>
      <Pressable onPress={onBack} accessibilityRole="button">
        <Text style={errStyles.backLink}>{t.back}</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loading (generating state)
// ---------------------------------------------------------------------------

function SkeletonCard() {
  const shimmer = useSharedValue(0.35);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <Animated.View style={[skeletonStyles.card, shimmerStyle]}>
      <View style={skeletonStyles.badgesRow}>
        <View style={[skeletonStyles.pill, { width: 52 }]} />
        <View style={[skeletonStyles.pill, { width: 44 }]} />
      </View>
      <View style={[skeletonStyles.line, { width: "70%" }]} />
      <View style={[skeletonStyles.line, { width: "95%", height: 11 }]} />
      <View style={[skeletonStyles.line, { width: "80%", height: 11 }]} />
    </Animated.View>
  );
}

function SkeletonView() {
  const { t } = useLanguage();
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={skeletonStyles.generatingRow}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={skeletonStyles.generatingText}>{t.generatingPlan}</Text>
      </View>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Accordion section (used inside ActivityCard)
// ---------------------------------------------------------------------------

interface AccordionSectionProps {
  title: string;
  icon: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentBg?: string;
}

function AccordionSection({
  title,
  icon,
  iconColor = Colors.primary,
  children,
  defaultOpen = false,
  accentBg,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const chevronRot = useSharedValue(defaultOpen ? 180 : 0);

  const toggle = useCallback(() => {
    const opening = !isOpen;
    setIsOpen(opening);
    chevronRot.value = withTiming(opening ? 180 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isOpen, chevronRot]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: chevronRot.value + "deg" }],
  }));

  return (
    <Animated.View layout={LinearTransition.duration(230)}>
      <Pressable
        style={accordStyles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
      >
        <Icon name={icon as never} size={15} color={iconColor} />
        <Text style={accordStyles.headerText}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <Icon name="expand-more" size={18} color={Colors.onSurfaceVariant} />
        </Animated.View>
      </Pressable>
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(150)}
          style={[
            accordStyles.content,
            accentBg != null ? { backgroundColor: accentBg } : null,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Activity card with timeline connector
// ---------------------------------------------------------------------------

const CONDITION_BG: Record<string, string> = {
  ASD: Colors.primaryContainer,
  ADHD: Colors.secondaryContainer,
  "Severe Allergy": "#fde8e8",
  Physical: Colors.tertiaryFixedDim,
};

function ActivityCard({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast: boolean;
}) {
  const { t } = useLanguage();
  const hasAdaptations =
    activity.specialNeedsAdaptations != null &&
    Object.keys(activity.specialNeedsAdaptations).length > 0;

  return (
    <View style={timelineStyles.row}>
      {/* Timeline left rail */}
      <View style={timelineStyles.timelineCol}>
        <View style={timelineStyles.dot} />
        {!isLast && <View style={timelineStyles.connector} />}
      </View>

      {/* Card body */}
      <Animated.View
        layout={LinearTransition.duration(230)}
        style={timelineStyles.card}
      >
        {/* Time + duration badges */}
        <View style={timelineStyles.badgesRow}>
          <View style={timelineStyles.timeBadge}>
            <Text style={timelineStyles.timeBadgeText}>
              {activity.timeSlot}
            </Text>
          </View>
          <View style={timelineStyles.durationBadge}>
            <Text style={timelineStyles.durationBadgeText}>
              {activity.durationMinutes} min
            </Text>
          </View>
        </View>

        <Text style={timelineStyles.activityTitle}>{activity.title}</Text>
        <Text style={timelineStyles.description}>{activity.description}</Text>

        {/* Pedagogical goals accordion */}
        {activity.pedagogicalGoals.length > 0 && (
          <AccordionSection
            title={t.pedagogicalGoals}
            icon="school"
            iconColor={Colors.primary}
          >
            <View style={accordStyles.bulletList}>
              {activity.pedagogicalGoals.map((goal, i) => (
                <View key={i} style={accordStyles.bulletRow}>
                  <View style={accordStyles.bullet} />
                  <Text style={accordStyles.bulletText}>{goal}</Text>
                </View>
              ))}
            </View>
          </AccordionSection>
        )}

        {/* Curriculum points accordion */}
        {activity.curriculumPoints.length > 0 && (
          <AccordionSection
            title={t.curriculumPoints}
            icon="menu-book"
            iconColor={Colors.secondary}
            accentBg={Colors.secondaryFixedDim}
          >
            <View style={accordStyles.chipRow}>
              {activity.curriculumPoints.map((code, i) => (
                <View key={i} style={accordStyles.codeChip}>
                  <Text style={accordStyles.codeChipText}>{code}</Text>
                </View>
              ))}
            </View>
          </AccordionSection>
        )}

        {/* Special needs adaptations */}
        {hasAdaptations && (
          <View style={timelineStyles.adaptBlock}>
            <View style={timelineStyles.adaptHeader}>
              <Icon
                name="accessibility-new"
                size={13}
                color={Colors.onSurfaceVariant}
              />
              <Text style={timelineStyles.adaptHeaderText}>
                {t.adaptations}
              </Text>
            </View>
            {Object.entries(activity.specialNeedsAdaptations!).map(
              ([child, text]) => {
                const condMatch = child.match(/:\s*([^\]]+)\]/);
                const bg =
                  CONDITION_BG[condMatch ? condMatch[1].trim() : ""] ??
                  Colors.surfaceContainerLow;
                return (
                  <View
                    key={child}
                    style={[timelineStyles.adaptRow, { backgroundColor: bg }]}
                  >
                    <Text style={timelineStyles.adaptChild}>{child}</Text>
                    <Text style={timelineStyles.adaptText}>{text}</Text>
                  </View>
                );
              },
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Regenerate confirmation modal
// ---------------------------------------------------------------------------

function RegenerateModal({
  visible,
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const { t } = useLanguage();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={modalStyles.backdrop} onPress={onDismiss}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Icon name="refresh" size={32} color={Colors.primary} />
          <Text style={modalStyles.title}>{t.regenerateTitle}</Text>
          <Text style={modalStyles.body}>{t.regenerateBody}</Text>
          <Pressable
            style={({ pressed }) => [
              modalStyles.confirmBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={onConfirm}
            accessibilityRole="button"
          >
            <Text style={modalStyles.confirmLabel}>{t.regenerate}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              modalStyles.cancelBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={onDismiss}
            accessibilityRole="button"
          >
            <Text style={modalStyles.cancelLabel}>{t.cancel}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
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

const llmStyles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSecondaryContainer,
  },
  track: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
    overflow: "hidden",
  },
  fill: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
  },
});

const planHeaderStyles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  overline: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: Colors.primary,
  },
  topic: {
    fontFamily: FontFamily.headline,
    fontSize: 22,
    lineHeight: 30,
    color: Colors.onPrimaryContainer,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.one,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  regenBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deleteBtn: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  actionBtnLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.secondary,
  },
  regenBtnLabel: {
    color: Colors.onPrimary,
  },
  deleteBtnLabel: {
    color: Colors.onError,
  },
});

const timelineStyles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  timelineCol: {
    width: 24,
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.primaryFixed,
    marginTop: 2,
    marginBottom: -4,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
    shadowColor: "#2f3334",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badgesRow: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  timeBadge: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  timeBadgeText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.secondary,
  },
  durationBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  durationBadgeText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
  activityTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  description: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  adaptBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  adaptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  adaptHeaderText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.onSurfaceVariant,
  },
  adaptRow: {
    borderRadius: Radius.sm,
    padding: Spacing.two,
    gap: 2,
  },
  adaptChild: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurface,
  },
  adaptText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
});

const accordStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
    marginTop: Spacing.one,
  },
  headerText: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  content: {
    borderRadius: Radius.sm,
    overflow: "hidden",
    paddingVertical: Spacing.two,
  },
  bulletList: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurface,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: Spacing.two,
  },
  codeChip: {
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  codeChipText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSecondaryFixed,
  },
});

const skeletonStyles = StyleSheet.create({
  generatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  generatingText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.three,
    shadowColor: "#2f3334",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  badgesRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  pill: {
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  line: {
    height: 14,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.five,
    paddingBottom: 48,
    paddingTop: Spacing.three,
    gap: Spacing.two,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.onSurface,
    textAlign: "center",
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    width: "100%",
    alignItems: "center",
  },
  confirmLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onPrimary,
  },
  cancelBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    width: "100%",
    alignItems: "center",
  },
  cancelLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
  },
});

const errStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.error,
    textAlign: "center",
  },
  message: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  retryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onPrimary,
  },
  backLink: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.secondary,
    textDecorationLine: "underline",
  },
});
