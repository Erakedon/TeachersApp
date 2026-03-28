/**
 * GeminiService — Stage 8
 *
 * Calls the Gemini REST API to generate a curriculum-aligned lesson plan.
 * The request contains ONLY anonymized data (no real child names).
 * Real names are re-inserted client-side by PrivacyRemapper after the
 * response arrives.
 *
 * Security guarantees:
 *   - API key read from expo-secure-store, never from source code
 *   - Only anonymized profile tags sent to the cloud
 *   - All PII stays on-device
 */

import type { GenerationParams, LessonPlan } from "@/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(params: GenerationParams): string {
  const topicLine = params.topic?.trim()
    ? `Topic chosen by teacher: "${params.topic.trim()}"`
    : "Topic: not specified — please suggest a seasonal, age-appropriate topic.";

  const specialLine = params.tagSummary
    ? `Special needs in group: ${params.tagSummary}`
    : "Special needs in group: none";

  const langLine =
    params.languageInstruction ?? "Odpowiadaj wyłącznie po polsku.";

  return `You are an expert Polish preschool pedagogical assistant (ages 3-6).
Generate a detailed chronological lesson plan for ${params.date}.
${langLine}

Context:
- ${topicLine}
- Season: ${params.season}
- ${specialLine}

Output ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "suggestedTopic": "string",
  "activities": [
    {
      "title": "string",
      "durationMinutes": 20,
      "timeSlot": "08:00",
      "description": "string",
      "pedagogicalGoals": ["string"],
      "curriculumPoints": ["4.1"],
      "specialNeedsAdaptations": { "[Child_A: ASD]": "string" }
    }
  ]
}

Rules:
- Include 5-7 activities covering the full preschool day (08:00-15:00).
- Each activity must have at least 2 pedagogicalGoals.
- Each activity must reference 1-3 curriculumPoints from the Polish podstawa programowa.
- Only include specialNeedsAdaptations when the group has special needs tags.
- specialNeedsAdaptations keys must exactly match the tags provided above.
- All text must be in Polish.`;
}

// ---------------------------------------------------------------------------
// Response validation
// ---------------------------------------------------------------------------

function parseLessonPlan(raw: string): LessonPlan {
  // Extract the JSON object — find first '{' and last '}' to handle any
  // surrounding markdown fences, prose, or whitespace the model may add.
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Gemini returned non-JSON response: ${raw.slice(0, 200)}`);
  }
  const cleaned = raw.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini JSON parse failed: ${cleaned.slice(0, 200)}`);
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.suggestedTopic !== "string") {
    throw new Error("Missing suggestedTopic in Gemini response");
  }
  if (!Array.isArray(obj.activities) || obj.activities.length === 0) {
    throw new Error("Missing or empty activities array in Gemini response");
  }

  const activities = (obj.activities as unknown[]).map((a, i) => {
    const act = a as Record<string, unknown>;
    return {
      title: typeof act.title === "string" ? act.title : `Activity ${i + 1}`,
      durationMinutes:
        typeof act.durationMinutes === "number" ? act.durationMinutes : 20,
      timeSlot: typeof act.timeSlot === "string" ? act.timeSlot : "08:00",
      description: typeof act.description === "string" ? act.description : "",
      pedagogicalGoals: Array.isArray(act.pedagogicalGoals)
        ? (act.pedagogicalGoals as string[])
        : [],
      curriculumPoints: Array.isArray(act.curriculumPoints)
        ? (act.curriculumPoints as string[])
        : [],
      specialNeedsAdaptations:
        act.specialNeedsAdaptations &&
        typeof act.specialNeedsAdaptations === "object"
          ? (act.specialNeedsAdaptations as Record<string, string>)
          : undefined,
    };
  });

  return {
    suggestedTopic: obj.suggestedTopic,
    activities,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class GeminiService {
  constructor(private readonly apiKey: string) {}

  /**
   * Generate a lesson plan from anonymized context.
   *
   * @throws {Error} on network failure, timeout, non-200 HTTP status,
   *   or malformed JSON response.
   */
  async generateLessonPlan(params: GenerationParams): Promise<LessonPlan> {
    const prompt = buildPrompt(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 16384,
      },
    });

    let response: Response;
    try {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === "AbortError") {
        throw new Error("Gemini request timed out after 30 seconds");
      }
      throw new Error(`Network error: ${(err as Error).message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const json = (await response.json()) as {
      candidates?: {
        content?: { parts?: { text?: string; thought?: boolean }[] };
      }[];
    };

    const parts = json.candidates?.[0]?.content?.parts ?? [];
    // gemini-2.5-flash returns thinking parts (thought: true) before the
    // actual response — skip them and take the first non-thought text part.
    const text =
      parts.find((p) => !p.thought && typeof p.text === "string")?.text ??
      parts.find((p) => typeof p.text === "string")?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    // Retry logic: attempt parse; on failure throw so caller can retry
    return parseLessonPlan(text);
  }
}
