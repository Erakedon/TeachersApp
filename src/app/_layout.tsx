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
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import React, { Suspense, useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ModelDownloadBanner } from "@/components/model-download-banner";
import { Colors } from "@/constants/theme";
import { EdgeAIProvider } from "@/contexts/edge-ai-context";
import { runMigrations, seedInitialData } from "@/db/migrations";

// Module-level stable function — never recreated, so SQLiteProvider
// does not see a new onInit prop on every render of RootLayout.
async function initDB(db: SQLiteDatabase) {
  await runMigrations(db);
  await seedInitialData(db);
}

SplashScreen.preventAutoHideAsync();

// Module-level constants so withLayoutContext never sees changed object
// references across re-renders, which would synchronously update the
// parent navigator state and cause an infinite render loop.
const STACK_SCREEN_OPTIONS = { headerShown: false } as const;
const DAY_PLAN_SCREEN_OPTIONS = { animation: 'slide_from_right' } as const;

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
        <EdgeAIProvider>
          {/*
           * useSuspense avoids the setLoading(true→false) state toggle
           * that the non-suspense SQLiteProvider uses. The React.use()
           * call inside resolves synchronously once the DB promise is
           * settled, so the Stack only ever mounts ONCE — eliminating
           * the mount/unmount oscillation that drove the render loop.
           */}
          <Suspense fallback={null}>
            <SQLiteProvider
              databaseName="gentle_guardian.db"
              onInit={initDB}
              useSuspense
            >
              <Stack screenOptions={STACK_SCREEN_OPTIONS}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="day-plan/[date]"
                  options={DAY_PLAN_SCREEN_OPTIONS}
                />
              </Stack>
            </SQLiteProvider>
          </Suspense>
          {/* Download progress bar — stubbed until Stage 8 wires useLLM */}
          <ModelDownloadBanner />
        </EdgeAIProvider>
        {/* Animated splash lives outside Suspense so it's always visible */}
        <AnimatedSplashOverlay />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

