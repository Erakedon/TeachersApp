import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    useFonts as usePlusJakartaSansFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    primary: Colors.primary,
    card: Colors.surfaceContainerLowest,
    text: Colors.onSurface,
    border: Colors.outlineVariant,
    notification: Colors.error,
  },
};

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [jakartaLoaded] = usePlusJakartaSansFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const fontsLoaded = interLoaded && jakartaLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={appTheme}>
        {/*
         * Root Stack — owns the navigation hierarchy:
         *   (tabs)           → the three-tab area (Dashboard / Profiles / Settings)
         *   day-plan/[date]  → full-screen day plan, pushed on top of the tabs
         *
         * headerShown: false on all screens because each screen renders its
         * own AppHeader or back-navigation chrome.
         */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="day-plan/[date]"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
        {/* Splash overlay renders on top of everything while fonts load */}
        <AnimatedSplashOverlay />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
