import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { type ChildProfile } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChildProfileCardProps {
  profile: ChildProfile;
  onToggle: (id: string, value: boolean) => void;
  onEdit: (profile: ChildProfile) => void;
  onDelete: (id: string) => void;
}

export function ChildProfileCard({
  profile,
  onToggle,
  onEdit,
  onDelete,
}: ChildProfileCardProps) {
  const { t } = useLanguage();
  return (
    <View style={cardStyles.card}>
      {/* Avatar */}
      <View style={cardStyles.avatar}>
        <Icon name="child-care" size={22} color={Colors.primary} />
      </View>

      {/* Name + description */}
      <View style={cardStyles.info}>
        <Text style={cardStyles.name}>{profile.name}</Text>
        <Text style={cardStyles.description} numberOfLines={2}>
          {profile.conditionDescription}
        </Text>
      </View>

      {/* Controls */}
      <View style={cardStyles.controls}>
        {/* Active toggle */}
        <View style={cardStyles.toggleGroup}>
          <Switch
            value={profile.isActive}
            onValueChange={(v) => onToggle(profile.id, v)}
            trackColor={{
              false: Colors.surfaceContainer,
              true: Colors.primary,
            }}
            thumbColor={Colors.surfaceContainerLowest}
            ios_backgroundColor={Colors.surfaceContainer}
            accessibilityLabel={`${profile.name} active status`}
          />
          <Text
            style={[
              cardStyles.statusLabel,
              {
                color: profile.isActive
                  ? Colors.primary
                  : Colors.onSurfaceVariant,
              },
            ]}
          >
            {profile.isActive ? t.active : t.inactive}
          </Text>
        </View>

        {/* Edit / Delete */}
        <View style={cardStyles.actionRow}>
          <Pressable
            onPress={() => onEdit(profile)}
            hitSlop={8}
            accessibilityLabel={`${t.edit} ${profile.name}`}
            style={({ pressed }) => [
              cardStyles.iconBtn,
              pressed && cardStyles.iconBtnPressed,
            ]}
          >
            <Icon name="edit" size={18} color={Colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(profile.id)}
            hitSlop={8}
            accessibilityLabel={`${t.delete} ${profile.name}`}
            style={({ pressed }) => [
              cardStyles.iconBtn,
              pressed && cardStyles.iconBtnPressed,
            ]}
          >
            <Icon name="delete" size={18} color={Colors.error} />
          </Pressable>
        </View>
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  description: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.onSurfaceVariant,
  },
  controls: {
    alignItems: "center",
    gap: Spacing.two,
    flexShrink: 0,
  },
  toggleGroup: {
    alignItems: "center",
    gap: 2,
  },
  statusLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
});
