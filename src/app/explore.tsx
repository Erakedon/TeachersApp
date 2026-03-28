import { Redirect } from "expo-router";

/**
 * explore.tsx is superseded by the (tabs)/profiles and (tabs)/settings routes.
 * This redirect ensures any old /explore URL is handled gracefully.
 */
export default function ExploreRedirect() {
  return <Redirect href="/profiles" />;
}
