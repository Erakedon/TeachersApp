import { Redirect } from "expo-router";

/**
 * Root index — redirects explicitly to the tabs group so Expo Router
 * doesn't see a circular `/ → /` redirect (which was the original bug
 * causing "Maximum update depth exceeded").
 *
 * `(tabs)` is a transparent group, but using `/(tabs)` as the href
 * targets the group itself rather than the ambiguous `/` URL.
 */
export default function RootIndex() {
  return <Redirect href="/(tabs)" />;
}
