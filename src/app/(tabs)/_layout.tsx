import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

import { Colors } from "@/constants/theme";

/**
 * Native tab bar layout for iOS & Android.
 * Uses NativeTabs from expo-router/unstable-native-tabs.
 *
 * Tab icons use PNG assets (renderingMode="template" lets the OS
 * tint them by active/inactive state).
 * Profiles and Settings currently reuse explore.png as a placeholder;
 * proper icon assets will be added in Stage 11.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={Colors.surfaceContainerLowest}
      indicatorColor={Colors.primaryContainer}
      labelStyle={{ selected: { color: Colors.primary } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profiles">
        <NativeTabs.Trigger.Label>Profiles</NativeTabs.Trigger.Label>
        {/* TODO Stage 11: replace with proper profiles icon */}
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/settings.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
