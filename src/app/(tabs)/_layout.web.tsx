import {
    TabList,
    TabListProps,
    TabSlot,
    TabTrigger,
    TabTriggerSlotProps,
    Tabs,
} from "expo-router/ui";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { MaterialIconName } from "@/components/icon";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";

/**
 * Web-specific tab layout using expo-router/ui Tabs.
 * Shows a compact horizontal tab bar at the top of the viewport.
 * Replaces the native NativeTabs for the web platform.
 */
export default function TabsLayoutWeb() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <WebTabBar>
          <TabTrigger name="dashboard" href="/" asChild>
            <WebTabButton icon="dashboard">Dashboard</WebTabButton>
          </TabTrigger>
          <TabTrigger name="profiles" href="/profiles" asChild>
            <WebTabButton icon="group">Profiles</WebTabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <WebTabButton icon="settings">Settings</WebTabButton>
          </TabTrigger>
        </WebTabBar>
      </TabList>
    </Tabs>
  );
}

type WebTabButtonProps = TabTriggerSlotProps & {
  icon: MaterialIconName;
  children: React.ReactNode;
};

function WebTabButton({
  children,
  isFocused,
  icon,
  ...props
}: WebTabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        bg={isFocused ? "primaryContainer" : "surfaceContainerLow"}
        style={styles.tabButton}
      >
        <Icon
          name={icon}
          size={18}
          color={
            isFocused ? Colors.onPrimaryContainer : Colors.onSurfaceVariant
          }
        />
        <ThemedText
          type="small"
          color={isFocused ? "onPrimaryContainer" : "onSurfaceVariant"}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function WebTabBar(props: TabListProps) {
  return (
    <View style={styles.tabBarOuter}>
      <ThemedView bg="surfaceContainerLowest" style={styles.tabBarInner}>
        <ThemedText
          variant="headlineSmall"
          color="primary"
          style={styles.brandText}
        >
          Teacher's App
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: "absolute",
    top: 0,
    width: "100%",
    padding: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    zIndex: 50,
  },
  tabBarInner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  brandText: {
    marginRight: "auto",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
