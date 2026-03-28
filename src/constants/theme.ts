import "@/global.css";

import { Platform, TextStyle } from "react-native";

// ---------------------------------------------------------------------------
// Color palette — extracted from the Gentle Guardian HTML designs (light only)
// All tokens follow Material Design 3 naming conventions.
// ---------------------------------------------------------------------------

export const Colors = {
  // Surfaces
  surface: "#f9f9f9",
  surfaceBright: "#f9f9f9",
  surfaceDim: "#d7dbdb",
  surfaceVariant: "#e0e3e4",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f4f4",
  surfaceContainer: "#eceeee",
  surfaceContainerHigh: "#e6e9e9",
  surfaceContainerHighest: "#e0e3e4",

  // Primary (forest green)
  primary: "#2d6957",
  primaryDim: "#1f5d4b",
  primaryFixed: "#b1efd8",
  primaryFixedDim: "#a3e1ca",
  primaryContainer: "#b1efd8",
  inversePrimary: "#bffee6",

  // On-primary
  onPrimary: "#e4fff3",
  onPrimaryFixed: "#004938",
  onPrimaryFixedVariant: "#296654",
  onPrimaryContainer: "#1d5c4a",

  // Secondary (muted blue-grey)
  secondary: "#4c6175",
  secondaryDim: "#405568",
  secondaryFixed: "#cee5fc",
  secondaryFixedDim: "#c0d7ee",
  secondaryContainer: "#cee5fc",

  // On-secondary
  onSecondary: "#f6f9ff",
  onSecondaryFixed: "#2c4254",
  onSecondaryFixedVariant: "#485e71",
  onSecondaryContainer: "#3e5467",

  // Tertiary (warm grey)
  tertiary: "#5f5f5c",
  tertiaryDim: "#535350",
  tertiaryFixed: "#ffffff",
  tertiaryFixedDim: "#f2f1ec",
  tertiaryContainer: "#ffffff",

  // On-tertiary
  onTertiary: "#fbf9f4",
  onTertiaryFixed: "#50504d",
  onTertiaryFixedVariant: "#6d6d69",
  onTertiaryContainer: "#62625f",

  // Error
  error: "#a83836",
  errorDim: "#67040d",
  errorContainer: "#fa746f",
  onError: "#fff7f6",
  onErrorContainer: "#6e0a12",

  // Background & on-background
  background: "#f9f9f9",
  onBackground: "#2f3334",

  // On-surface
  onSurface: "#2f3334",
  onSurfaceVariant: "#5b6061",
  inverseSurface: "#0c0f0f",
  inverseOnSurface: "#9c9d9d",

  // Outline
  outline: "#777b7c",
  outlineVariant: "#afb3b3",

  // Misc tints
  surfaceTint: "#2d6957",
} as const;

export type ColorToken = keyof typeof Colors;

// ---------------------------------------------------------------------------
// Font family names — must exactly match the keys registered via useFonts()
// in the root _layout.tsx
// ---------------------------------------------------------------------------

export const FontFamily = {
  headline: "PlusJakartaSans_700Bold",
  headlineMedium: "PlusJakartaSans_600SemiBold",
  headlineLight: "PlusJakartaSans_400Regular",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  mono:
    Platform.select({
      ios: "Courier New",
      android: "monospace",
      web: "monospace",
    }) ?? "monospace",
} as const;

// ---------------------------------------------------------------------------
// Shape (border radius) tokens
// ---------------------------------------------------------------------------

export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16, // DEFAULT in the design system
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Spacing scale (in dp)
// ---------------------------------------------------------------------------

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ---------------------------------------------------------------------------
// Typography presets
// TextStyle objects ready for use in StyleSheet.create()
// ---------------------------------------------------------------------------

export const Typography = {
  // Display / hero — 48px
  displayLarge: {
    fontFamily: FontFamily.headline,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  } as TextStyle,

  // Section title — 32px
  displayMedium: {
    fontFamily: FontFamily.headline,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  } as TextStyle,

  // Screen heading — 24px  ("Dashboard", "Special Requirements")
  headlineLarge: {
    fontFamily: FontFamily.headline,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } as TextStyle,

  // Card / section title — 20px
  headlineMedium: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 20,
    lineHeight: 28,
  } as TextStyle,

  // Sub-section — 16px bold
  headlineSmall: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  // Body — 16px regular
  bodyLarge: {
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  // Body — 14px regular
  bodyMedium: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  // Body — 12px regular
  bodySmall: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  // Label / button — 14px medium
  labelLarge: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  // Label — 12px medium
  labelMedium: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // Overline — 10px bold, all-caps tracking
  overline: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof Typography;

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
