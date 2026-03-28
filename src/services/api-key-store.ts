/**
 * Gemini API key accessor.
 *
 * The key is bundled via the EXPO_PUBLIC_GEMINI_API_KEY environment variable
 * (stored in .env.local, which is gitignored). It is never typed by the user
 * and never fetched from a remote source.
 */

const BUNDLED_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? null;

export async function getGeminiApiKey(): Promise<string | null> {
  return BUNDLED_KEY;
}

// No-ops kept so call-sites that were written for SecureStore don't break.
export async function setGeminiApiKey(_key: string): Promise<void> {}
export async function deleteGeminiApiKey(): Promise<void> {}
export function isValidKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  return trimmed.startsWith("AIza") && trimmed.length >= 35;
}
