# Gentle Guardian — Teacher's AI Lesson Planner

A GDPR-compliant AI assistant for Polish preschool teachers (ages 3–6). It generates structured, curriculum-aligned daily lesson plans using Google Gemini, while keeping all child data strictly on-device.

## Features

- **AI lesson plan generation** — sends an anonymized classroom context to Gemini 2.5 Flash and receives a full chronological day plan (08:00–15:00) with pedagogical goals and curriculum references (*podstawa programowa*).
- **On-device PII scrubbing** — child names are replaced by anonymous tags (`Child_A`, `Child_B`, …) before any data leaves the device, using an on-device LLM (QWEN3 0.6B via ExecuTorch) or a rule-based fallback.
- **Child profiles** — manage active/inactive profiles with free-text special-needs descriptions that feed the AI context.
- **Month calendar** — dashboard view showing which days already have a saved plan.
- **Offline-first** — all plans and profiles stored in SQLite on-device.
- **Bilingual UI** — Polish and English, switchable at any time from Settings. The generated plan language follows the selected language.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55 (canary), React Native 0.83 |
| Navigation | Expo Router (file-based) |
| Database | expo-sqlite v15 |
| Cloud AI | Google Gemini 2.5 Flash REST API |
| Edge AI | react-native-executorch 0.8 (QWEN3 0.6B quantized) |
| Storage | expo-secure-store |
| Language | TypeScript |

## Prerequisites

- **Node.js** 18 or later
- **Android Studio** with an Android emulator (API 33+), or a physical Android device with USB debugging enabled
- *(iOS)* Xcode 15+ and an Apple Developer account for device builds
- A **Google Gemini API key** — obtain one for free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

> **Note:** This app uses native modules (SQLite, ExecuTorch, SecureStore) and **cannot run in Expo Go**. A development build is required.

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/Erakedon/TeachersApp.git
cd TeachersApp
npm install
```

### 2. Add your Gemini API key

Copy the example environment file and paste your key:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder:

```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...your-real-key-here...
```

> The key is bundled at build time via Expo's `EXPO_PUBLIC_` prefix. It is never sent alongside child data — the AI receives only anonymized tags.

### 3. Build and run

**Android (emulator or device):**

```bash
npm run android
# or: npx expo run:android
```

**iOS (simulator or device):**

```bash
npx expo run:ios
```

**Web (limited — native modules unavailable):**

```bash
npm run web
```

The first time you tap **Generate Plan**, ExecuTorch downloads the on-device model (~350 MB) for PII scrubbing. Subsequent uses work from cache.

## Project Structure

```
src/
  app/                  # Expo Router screens
    (tabs)/             # Tab navigator (Dashboard, Profiles, Settings)
    day-plan/[date].tsx # AI generation + plan view
  components/           # Reusable UI components
  constants/theme.ts    # Design tokens (colors, spacing, typography)
  contexts/             # React contexts (LanguageContext)
  db/                   # SQLite repositories and migrations
  i18n/                 # Translation files (pl.ts, en.ts)
  services/             # Gemini service, privacy remapper, key store
  types/                # Shared TypeScript types
```

## Privacy & GDPR

- Child names and condition descriptions **never leave the device**.
- Before each Gemini call, profiles are reduced to anonymous tags (`[Child_A: ADHD]`).
- Real names are re-inserted client-side after the response is received.
- All data is stored locally in SQLite; no analytics or telemetry.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Yes | Google Gemini REST API key |

## License

MIT
