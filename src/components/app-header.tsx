import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Spacing } from "@/constants/theme";

/**
 * Fixed top navigation bar present on all tab screens.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <Text style={styles.title}>Teacher's App</Text>

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
