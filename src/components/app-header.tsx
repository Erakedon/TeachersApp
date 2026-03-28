import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Spacing } from "@/constants/theme";

type AppHeaderProps = {
  onMenuPress?: () => void;
};

/**
 * Fixed top navigation bar present on all tab screens.
 * Matches the design in dashboard.html and profiles.html:
 *   [≡ menu]  Teacher's App          [avatar]
 *
 * The header uses a semi-transparent white background to mimic
 * the frosted glass effect from the HTML designs (expo-blur will
 * be added in Stage 11 Polish).
 */
export function AppHeader({ onMenuPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        {/* Left group: hamburger + app name */}
        <View style={styles.leftGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Icon name="menu" size={24} color={Colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.title}>Teacher's App</Text>
        </View>

        {/* Right: teacher avatar circle */}
        <View style={styles.avatarContainer}>
          <Icon name="person" size={20} color={Colors.primary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 50,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonPressed: {
    backgroundColor: Colors.primaryFixed,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: 20,
    color: "#1b3d31", // emerald-900 from the HTML design
    letterSpacing: -0.3,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryFixed,
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
