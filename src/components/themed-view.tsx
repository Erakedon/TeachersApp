import { View, type ViewProps } from 'react-native';

import { ColorToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  /** Background color token from the design system */
  bg?: ColorToken;
  /**
   * Legacy type prop kept for backward compatibility.
   * Prefer `bg` for new code.
   */
  type?: ColorToken;
};

export function ThemedView({ style, bg, type, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();
  const token = bg ?? type ?? 'background';

  return <View style={[{ backgroundColor: colors[token] }, style]} {...otherProps} />;
}
