/**
 * PrivacyRemapper — Stage 8
 *
 * Walks a generated LessonPlan and replaces all anonymous tags
 * (e.g. "[Child_A]", "[Child_A: ASD]") with the corresponding real
 * child names from the PrivacyMap.
 *
 * Operates entirely client-side AFTER the Gemini response arrives.
 * The cloud never sees real names.
 */

import type { LessonPlan, PrivacyMap } from "@/types";

/**
 * Replace all tag occurrences in a string, e.g.:
 *   "[Child_A: ASD]"  →  "Leo"
 *   "[Child_A]"       →  "Leo"
 */
function remapString(text: string, map: PrivacyMap): string {
  let result = text;
  for (const [key, realName] of Object.entries(map.mapping)) {
    // Match "[Child_A: anything]" OR "[Child_A]"
    const pattern = new RegExp(`\\[${key}(?::[^\\]]*)?\\]`, "g");
    result = result.replace(pattern, realName);
  }
  return result;
}

/**
 * Re-map all anonymous tags inside a LessonPlan to real child names.
 * Returns a new LessonPlan object (does not mutate the input).
 */
export function remapLessonPlan(
  plan: LessonPlan,
  privacyMap: PrivacyMap,
): LessonPlan {
  if (Object.keys(privacyMap.mapping).length === 0) {
    return plan; // Nothing to remap
  }

  return {
    suggestedTopic: remapString(plan.suggestedTopic, privacyMap),
    activities: plan.activities.map((activity) => {
      const remappedAdaptations: Record<string, string> | undefined =
        activity.specialNeedsAdaptations
          ? Object.fromEntries(
              Object.entries(activity.specialNeedsAdaptations).map(
                ([tag, text]) => [
                  remapString(tag, privacyMap),
                  remapString(text, privacyMap),
                ],
              ),
            )
          : undefined;

      return {
        ...activity,
        title: remapString(activity.title, privacyMap),
        description: remapString(activity.description, privacyMap),
        pedagogicalGoals: activity.pedagogicalGoals.map((g) =>
          remapString(g, privacyMap),
        ),
        specialNeedsAdaptations: remappedAdaptations,
      };
    }),
  };
}
