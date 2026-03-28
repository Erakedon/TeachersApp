import { Platform, StyleSheet, Text, type TextProps } from "react-native";

import {
    ColorToken,
    FontFamily,
    TypographyVariant
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  /** Typography scale variant — maps to a Typography preset from theme.ts */
  variant?: TypographyVariant;
  /** Color token from the design system */
  color?: ColorToken;
  /**
   * Legacy type prop kept for backward compatibility with existing screens.
   * Prefer `variant` for new code.
   */
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
};

export function ThemedText({
  style,
  variant,
  color,
  type,
  ...rest
}: ThemedTextProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      style={[
        styles.base,
        { color: color ? colors[color] : colors.onSurface },
        variant && typography[variant],
        // Legacy type mappings
        type === "default" && styles.legacyDefault,
        type === "title" && styles.legacyTitle,
        type === "small" && styles.legacySmall,
        type === "smallBold" && styles.legacySmallBold,
        type === "subtitle" && styles.legacySubtitle,
        type === "link" && styles.legacyLink,
        type === "linkPrimary" && styles.legacyLinkPrimary,
        type === "code" && styles.legacyCode,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 24,
  },
  // --- Legacy type styles (backward compat) ---
  legacyDefault: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  legacySmall: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  legacySmallBold: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  legacyTitle: {
    fontFamily: FontFamily.headline,
    fontSize: 48,
    lineHeight: 52,
  },
  legacySubtitle: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 32,
    lineHeight: 44,
  },
  legacyLink: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 30,
  },
  legacyLinkPrimary: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 30,
    color: "#3c87f7",
  },
  legacyCode: {
    fontFamily: FontFamily.mono,
    fontWeight: Platform.select({ android: "700" }) ?? "500",
    fontSize: 12,
  },
});
