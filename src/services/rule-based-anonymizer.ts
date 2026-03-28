/**
 * Rule-based PII anonymizer — deterministic, always available, zero latency.
 *
 * Used as:
 *   1. The primary anonymizer when the LLM model has not yet downloaded.
 *   2. The permanent fallback if ExecuTorch fails to load on a device.
 *
 * Algorithm:
 *   - Assigns each profile a stable label: Child_A, Child_B, …
 *   - Produces tags like "[Child_A: ASD]" — no real names, no PII.
 *   - Builds a reverse mapping so the UI can un-redact names after the cloud
 *     response arrives.
 */

import {
    type AnonymizedContext,
    type ChildProfile,
    type PrivacyMap,
} from "@/types";

export function rulesBasedScrub(profiles: ChildProfile[]): AnonymizedContext {
  const active = profiles.filter((p) => p.isActive);

  if (active.length === 0) {
    return {
      privacyMap: { tags: [], mapping: {} },
      tagSummary: "No children with special requirements in the group.",
    };
  }

  const tags: string[] = [];
  const mapping: Record<string, string> = {};

  active.forEach((profile, index) => {
    const key = `Child_${String.fromCharCode(65 + index)}`; // Child_A, Child_B, …
    const tag = `[${key}: ${profile.conditionDescription}]`;
    tags.push(tag);
    mapping[key] = profile.name;
  });

  const privacyMap: PrivacyMap = { tags, mapping };
  const tagSummary = tags.join(", ");

  return { privacyMap, tagSummary };
}
