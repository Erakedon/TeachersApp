import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Icon, MaterialIconName } from "@/components/icon";
import { Colors, FontFamily, Radius, Spacing } from "@/constants/theme";
import { type ChildProfile, type ConditionType } from "@/types";

interface ConditionConfig {
  icon: MaterialIconName;
  avatarBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}

const CONDITION_CONFIG: Record<ConditionType, ConditionConfig> = {
  ASD: {
    icon: "child-care",
    avatarBg: "#ecfdf5", // emerald-50
    iconColor: Colors.primary,
    badgeBg: Colors.secondaryContainer,
    badgeText: Colors.onSecondaryContainer,
  },
  "Severe Allergy": {
    icon: "medical-services",
    avatarBg: "#fff7ed", // orange-50
    iconColor: "#c2410c", // orange-700
    badgeBg: Colors.errorContainer,
    badgeText: Colors.onErrorContainer,
  },
  ADHD: {
    icon: "accessible-forward",
    avatarBg: "#eff6ff", // blue-50
    iconColor: "#1d4ed8", // blue-700
    badgeBg: Colors.secondaryContainer,
    badgeText: Colors.onSecondaryContainer,
  },
  Physical: {
    icon: "blind",
    avatarBg: "#faf5ff", // purple-50
    iconColor: "#7e22ce", // purple-700
    badgeBg: Colors.secondaryContainer,
    badgeText: Colors.onSecondaryContainer,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChildProfileCardProps {
  profile: ChildProfile;
  onToggle: (id: string, value: boolean) => void;
}

export function ChildProfileCard({ profile, onToggle }: ChildProfileCardProps) {
  const cfg = CONDITION_CONFIG[profile.condition];

  return (
    <View style={cardStyles.card}>
      {/* Left: avatar + name + badge */}
      <View style={cardStyles.left}>
        <View style={[cardStyles.avatar, { backgroundColor: cfg.avatarBg }]}>
          <Icon name={cfg.icon} size={22} color={cfg.iconColor} />
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.name}>{profile.name}</Text>
          <View style={cardStyles.badgeRow}>
            <View style={[cardStyles.badge, { backgroundColor: cfg.badgeBg }]}>
              <Text style={[cardStyles.badgeLabel, { color: cfg.badgeText }]}>
                {profile.condition}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right: toggle + status label */}
      <View style={cardStyles.right}>
        <Switch
          value={profile.isActive}
          onValueChange={(v) => onToggle(profile.id, v)}
          trackColor={{ false: Colors.surfaceContainer, true: Colors.primary }}
          thumbColor={Colors.surfaceContainerLowest}
          ios_backgroundColor={Colors.surfaceContainer}
          accessibilityLabel={`${profile.name} active status`}
        />
        <Text
          style={[
            cardStyles.statusLabel,
            {
              color: profile.isActive ? Colors.primary : Colors.onSurfaceVariant,
            },
          ]}
        >
          {profile.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    gap: Spacing.one,
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  right: {
    alignItems: "center",
    gap: Spacing.one,
  },
  statusLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
