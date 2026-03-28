import {
    Colors,
    ColorToken,
    Typography
} from "@/constants/theme";

/**
 * Returns the app's design token objects.
 * Light-mode only for the current release.
 */
export function useTheme() {
  return {
    colors: Colors,
    typography: Typography,
    color: (token: ColorToken) => Colors[token],
  };
}
