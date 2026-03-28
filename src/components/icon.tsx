import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

export type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

type IconProps = {
  name: MaterialIconName;
  size?: number;
  color?: string;
};

/**
 * Thin wrapper around MaterialIcons from @expo/vector-icons.
 * Import this instead of MaterialIcons directly so the icon
 * source can be swapped in a single place if needed.
 */
export function Icon({ name, size = 24, color }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
