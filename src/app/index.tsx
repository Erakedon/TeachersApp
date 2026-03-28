import { Redirect } from 'expo-router';

/**
 * Root index — redirects to the Dashboard (tabs group is transparent,
 * so '/' routes to (tabs)/index.tsx directly).
 *
 * This file is kept to give Expo Router a root route definition.
 */
export default function RootIndex() {
  return <Redirect href="/" />;
}
