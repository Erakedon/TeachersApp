// ---------------------------------------------------------------------------
// Domain entity types
// These are pure TypeScript interfaces — no DB coupling.
// Stage 6 repositories map DB rows to/from these shapes.
// ---------------------------------------------------------------------------

export type ConditionType = 'ASD' | 'Severe Allergy' | 'ADHD' | 'Physical';

export interface ChildProfile {
  id: string;           // UUID (text)
  name: string;
  age?: number;
  condition: ConditionType;
  notes?: string;
  isActive: boolean;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}

export interface DayPlan {
  id: string;
  date: string;         // 'YYYY-MM-DD'
  topic?: string;
  rawJson: string;      // serialised Gemini response
  createdAt: string;
}

export type TaskPriority = 'urgent' | 'normal';

export interface PendingTask {
  id: string;
  description: string;
  priority: TaskPriority;
  isDone: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Stage 7 — Edge AI / PII scrubbing types
// ---------------------------------------------------------------------------

/**
 * Maps anonymous tag keys (e.g. "Child_A") to real child names (e.g. "Leo").
 * Kept in memory only — never persisted to disk or sent to any cloud service.
 */
export interface PrivacyMap {
  /** e.g. ["[Child_A: ASD]", "[Child_B: Severe Allergy]"] */
  tags: string[];
  /** e.g. { "Child_A": "Leo", "Child_B": "Mia" } */
  mapping: Record<string, string>;
}

/**
 * The anonymized context that the cloud AI (Gemini) will receive.
 * Contains no real child names.
 */
export interface AnonymizedContext {
  privacyMap: PrivacyMap;
  /** Comma-separated tag string ready to inject into the Gemini prompt. */
  tagSummary: string;
}
