/**
 * EdgeAI Context — Stage 7
 *
 * Provides on-device PII scrubbing via the deterministic rule-based anonymizer.
 * The rule-based approach is always instantaneous, requires no downloads, and
 * guarantees perfect privacy by never including real child names.
 *
 * The LLM hook (react-native-executorch useLLM) is intentionally NOT placed
 * here — it carries internal React state that causes layout-effect loops when
 * mounted in the root layout alongside Expo Router's Stack navigator. The LLM
 * will be wired directly into the day-plan generation screen in Stage 8 where
 * it can download and run completely independently of the navigation tree.
 */

import React, { createContext, useCallback, useContext } from 'react';

import { rulesBasedScrub } from '@/services/rule-based-anonymizer';
import { type AnonymizedContext, type ChildProfile } from '@/types';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface EdgeAIContextValue {
  /**
   * Anonymize the given profiles on-device using the deterministic rule-based
   * anonymizer. Zero latency, no model required.
   */
  scrubProfiles(profiles: ChildProfile[]): Promise<AnonymizedContext>;
}

const EdgeAIContext = createContext<EdgeAIContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function EdgeAIProvider({ children }: { children: React.ReactNode }) {
  const scrubProfiles = useCallback(
    async (profiles: ChildProfile[]): Promise<AnonymizedContext> =>
      rulesBasedScrub(profiles),
    [],
  );

  return (
    <EdgeAIContext.Provider value={{ scrubProfiles }}>
      {children}
    </EdgeAIContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useEdgeAI(): EdgeAIContextValue {
  const ctx = useContext(EdgeAIContext);
  if (!ctx) {
    throw new Error('useEdgeAI must be used within an EdgeAIProvider');
  }
  return ctx;
}
