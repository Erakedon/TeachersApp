# Teachers App — Development Plan

**App codename:** Gentle Guardian  
**Target:** Polish preschool teachers  
**Platform:** iOS & Android (React Native / Expo)

---

## Overview

The application is a GDPR-compliant, AI-powered lesson planning assistant. It uses a hybrid AI architecture: an on-device model (React Native ExecuTorch) anonymizes sensitive data before it ever leaves the device, and a cloud model (Google Gemini API) generates rich, curriculum-aligned lesson plans from the sanitized context. All child profiles are stored exclusively on-device via Expo SQLite.

The four exported HTML designs in the `/designs` folder are the authoritative visual reference and must be faithfully translated into React Native components at each relevant stage.

---

## Stage 1 — Design System & Foundation

**Goal:** Establish the single source of truth for all visual tokens so every subsequent stage builds on a consistent base.

### Tasks

1. **Extend `src/constants/theme.ts`** with the full Material Design color token set extracted from the HTML designs:
   - All semantic surface tokens (`surface`, `surface-container`, `surface-container-lowest`, etc.)
   - Primary / secondary / tertiary role colors
   - Error, outline, and on-color variants
   - Both light and (optionally) dark mode mappings

2. **Load custom fonts** using `expo-font`:
   - **Plus Jakarta Sans** (weights 400, 500, 600, 700, 800) — used for all headings and display text
   - **Inter** (weights 400, 500, 600) — used for all body and label text
   - Export typed font family constants alongside the color tokens

3. **Define spacing and shape tokens:**
   - Border radii matching the design (`DEFAULT: 16`, `lg: 32`, `xl: 48`, `full: 9999`) in dp/pixels
   - Spacing scale aligned with the existing `Spacing` object

4. **Create a `Typography` preset object** in `theme.ts`:
   - Styles for `headline` (Plus Jakarta Sans, bold, tight tracking)
   - Styles for `body` and `label` (Inter, regular/medium)
   - Styles for `caption` and `overline` (Inter, small, wide tracking)

5. **Update `ThemedText`** to consume the new typography and color tokens rather than hard-coded values.

6. **Create a `useTheme()` hook** that returns the current theme's color and font tokens — this will be imported by all screen components.

### Deliverable
A fully typed theme module that any component can import to get pixel-perfect design tokens matching the Gentle Guardian design system. No visual screens are built yet.

---

## Stage 2 — App Shell & Navigation

**Goal:** Build the navigation skeleton — the top bar, the three-tab bottom navigator, and the Expo Router file structure — so every subsequent stage can slot screens into it.

### Tasks

1. **Restructure the Expo Router file tree** to reflect the three tabs visible in all four designs:
   ```
   src/app/
     _layout.tsx          ← root layout (fonts, splash, ThemeProvider)
     (tabs)/
       _layout.tsx        ← bottom tab navigator
       index.tsx          ← Dashboard tab
       profiles.tsx       ← Special Requirements tab
       settings.tsx       ← Settings tab
     day-plan/
       [date].tsx         ← Dynamic route: e.g. /day-plan/2026-03-28
   ```

2. **Build the `AppHeader` component** matching the design:
   - Hamburger menu icon (left)
   - App name "Teacher's App" (headline font, emerald-900)
   - Teacher avatar (right, 40×40 rounded-full, border `primary-fixed`)
   - Frosted glass effect (`backdrop-filter: blur(20px)`, white/80 background)
   - Fixed positioning, `z-index: 50`

3. **Build the `BottomTabBar`** matching the design:
   - Three items: Dashboard / Profiles / Settings
   - Active state: pill-shaped background (`emerald-100`), filled icon
   - Inactive state: zinc-500, outlined icon
   - Rounded top corners (`border-top-left-radius: 32`, `border-top-right-radius: 32`)
   - Frosted glass background
   - Uses Material Symbols icon names (via a lightweight icon wrapper)

4. **Set up `expo-vector-icons` or a lightweight SVG icon system** for Material Symbols (dashboard, face / group, settings, chevron, etc.).

5. **Wire up placeholder screens** for all three tabs and the day-plan dynamic route. Each shows the correct header and bottom bar but has placeholder content.

6. **Handle safe area insets** on all platforms (notch, home indicator, status bar).

### Deliverable
A running app that navigates between three tab screens and the day-plan route, with the correct header and bottom bar on every screen, matching the design shell.

---

## Stage 3 — Dashboard Screen (Calendar)

**Goal:** Implement the Dashboard screen as seen in `designs/dashboard.html` — interactive calendar, assistant tip card, and pending tasks panel.

### Tasks

1. **Build the `MonthCalendar` component:**
   - 7-column CSS-grid equivalent using `FlatList` or a manual grid layout
   - Day-of-week header row (Sun–Sat), uppercase, muted text
   - Days from previous/next month rendered at 30% opacity
   - "Today" indicator: primary-colored filled circle behind the date number, small "Today" label below
   - Days with a saved plan rendered with a small primary-colored dot indicator beneath the number
   - Month navigation (`chevron_left` / `chevron_right`) cycled through a local `selectedMonth` state
   - Tapping a day navigates to `/day-plan/[YYYY-MM-DD]`

2. **Build the `AssistantTipCard` component:**
   - Background: `secondary-container` (`#cee5fc`)
   - `lightbulb` icon + "Assistant Tip" header (headline font)
   - Body text: contextual hint (static placeholder for now, later driven by AI)

3. **Build the `PendingTasksPanel` component:**
   - Header: "PENDING TASKS" — overline style, muted
   - Each task: colored dot indicator (error red = urgent, secondary blue = normal) + task text
   - Static placeholder data for now; will be replaced by DB queries in Stage 6

4. **Compose the Dashboard layout:**
   - Two-column bento grid on wide screens (calendar 8/12, sidebar 4/12)
   - Single-column stacked layout on narrow screens (standard mobile)
   - `pt-24 pb-32 px-6` padding matching designs, `max-w-4xl mx-auto`

5. **Add the "Dashboard" screen header section:**
   - Large bold title "Dashboard"
   - Subtitle: "Organize your month and nurture curiosity with AI-guided lessons."

### Deliverable
A fully interactive Dashboard screen with a working calendar and navigation to the day-plan route. Visually matches `dashboard.html`.

---

## Stage 4 — Special Requirements Profiles Screen (UI)

**Goal:** Build the Profiles screen UI as seen in `designs/profiles.html`. The data layer is wired in Stage 6.

### Tasks

1. **Build the GDPR compliance banner:**
   - Left accent border (4px, primary green)
   - `verified_user` icon + disclaimer text
   - Background: `surface-container-low`
   - Must appear at the top of the profiles list, above all cards

2. **Build the `ChildProfileCard` component:**
   - 48×48 avatar circle with condition-specific background color and icon:
     - ASD → emerald-50 background, `child_care` icon, primary color
     - Severe Allergy → orange-50 background, `medical_services` icon, orange-700
     - ADHD → blue-50 background, `accessibility_new` icon, blue-700
     - Physical → purple-50 background, `blind` icon, purple-700
   - Child name (bold, `text-on-surface`, large)
   - Condition badge(s): pill shape, `secondary-container` / `error-container` background, 10px bold uppercase text
   - Toggle switch (right side): active state = primary green track
   - "Active" / "Inactive" label beneath the toggle

3. **Build the `AddProfileButton` component:**
   - Dashed border (`border-dashed`, `border-primary/30`)
   - `primary-container` background
   - `person_add` icon + "Add Child Profile" label

4. **Build the screen header:**
   - Overline: "CARE MANAGEMENT" (uppercase, small, wide tracking)
   - H1: "Special Requirements" (bold, 3xl, headline font)

5. **Build the `AddProfileModal` / screen (static draft):**
   - Fields: Name (text), Age (number), Condition type (select/picker), Notes (multiline text)
   - Cancel and Save buttons
   - No DB connection yet — form validation only

### Deliverable
Profiles screen fully rendered with static data arrays. Visually matches `profiles.html`. Tapping "Add Child Profile" opens the add form.

---

## Stage 5 — Day Plan: Unplanned View

**Goal:** Build the "Empty Day" screen seen in `designs/dayPlanUnplanned.html` — the primary AI generation entry point.

### Tasks

1. **Build the screen header:**
   - Back navigation button (returns to Dashboard)
   - Date label (e.g., "Thursday, October 12") — dynamic from router param `[date]`
   - Subheading: "No plan created yet"

2. **Build the `TopicInput` component:**
   - Multiline `TextInput` with rounded card styling (`surface-container-lowest`, shadow)
   - Label: "Topic of the Day (optional)"
   - Placeholder text: `"Leave blank and I'll suggest a context-appropriate topic based on the season, upcoming holidays, and your group's recent activities."`
   - Character counter (soft limit hint)

3. **Build the `ContextSummaryCard` component:**
   - Displays what the AI will consider: current season, nearby Polish public holidays, number of active special-needs profiles
   - Background: `surface-container-low`, rounded-lg
   - `info` icon + list of context chips

4. **Build the `GeneratePlanButton` (primary CTA):**
   - Full-width, large, `primary` background (`#2d6957`), white text
   - `auto_fix_high` or `psychology` icon
   - Label: "Generate Lesson Plan"
   - Subtle shadow and rounded corners (`border-radius: 16`)
   - Loading state: spinner replaces icon, label changes to "Generating…"

5. **Wire the navigation parameter:** read `params.date` from the router and display the formatted date.

6. **Implement the generation flow stub:** tapping the button shows a `loading` state for 2 seconds then navigates to the Planned view (with mock data for now).

### Deliverable
The unplanned day screen fully matches `dayPlanUnplanned.html`. Tapping Generate runs a mock flow and transitions to the next screen.

---

## Stage 6 — Local Data Layer (Expo SQLite)

**Goal:** Implement all on-device data persistence using Expo SQLite, replacing static mock data throughout the app.

### Tasks

1. **Install and configure `expo-sqlite`.**

2. **Design the database schema:**

   ```sql
   CREATE TABLE child_profiles (
     id          TEXT PRIMARY KEY,  -- UUID
     name        TEXT NOT NULL,
     age         INTEGER,
     condition   TEXT NOT NULL,     -- 'ASD' | 'ADHD' | 'ALLERGY' | 'PHYSICAL' | 'OTHER'
     notes       TEXT,
     is_active   INTEGER NOT NULL DEFAULT 1,  -- 0 | 1
     created_at  TEXT NOT NULL,
     updated_at  TEXT NOT NULL
   );

   CREATE TABLE day_plans (
     id          TEXT PRIMARY KEY,
     date        TEXT NOT NULL UNIQUE,  -- 'YYYY-MM-DD'
     topic       TEXT,
     raw_json    TEXT NOT NULL,         -- full Gemini response, JSON string
     created_at  TEXT NOT NULL
   );

   CREATE TABLE pending_tasks (
     id          TEXT PRIMARY KEY,
     description TEXT NOT NULL,
     priority    TEXT NOT NULL DEFAULT 'normal',  -- 'urgent' | 'normal'
     is_done     INTEGER NOT NULL DEFAULT 0,
     created_at  TEXT NOT NULL
   );
   ```

3. **Implement a `DatabaseService`** singleton:
   - `openDatabase()` — opens/creates the DB file
   - `runMigrations()` — idempotent schema migration runner
   - Called once during app startup in `_layout.tsx`

4. **Implement `ChildProfileRepository`:**
   - `getAll(): ChildProfile[]`
   - `getActiveProfiles(): ChildProfile[]`
   - `insert(profile): void`
   - `update(id, fields): void`
   - `delete(id): void`
   - `toggleActive(id): void`

5. **Implement `DayPlanRepository`:**
   - `getByDate(date): DayPlan | null`
   - `save(plan): void`
   - `delete(date): void`

6. **Implement `PendingTaskRepository`:**
   - `getAll(): PendingTask[]`
   - `insert(task): void`
   - `markDone(id): void`

7. **Wire repositories to screens:**
   - Profiles screen: load from DB, connect toggle switch, connect "Add Profile" form save, connect delete swipe gesture
   - Dashboard: load `day_plans` dates to render dot indicators on calendar; load `pending_tasks` for the sidebar panel

8. **Define TypeScript interfaces** for all entities in `src/types/`.

### Deliverable
Full CRUD for child profiles persisted on-device. Calendar dots appear for dates that have saved plans. Pending tasks load from DB.

---

## Stage 7 — Edge AI: PII Scrubbing (React Native ExecuTorch)

**Goal:** Integrate React Native ExecuTorch to run an on-device language model that anonymizes child profile data before it is sent to any cloud service. No PII ever leaves the device.

### Tasks

1. **Install and link `react-native-executorch`:**
   - Requires bare React Native workflow or Expo with a custom dev client
   - Configure native module linking for iOS (CocoaPods) and Android (Gradle)
   - Add the `.pte` model file to the appropriate native assets directories

2. **Select and bundle a quantized on-device model:**
   - Recommended: Gemma 2B INT4 quantized (`.pte` format) — small enough for mobile, capable enough for tag generation
   - Store the model in `assets/models/scrubber.pte`
   - Follow ExecuTorch documentation for loading from the bundle

3. **Build the `EdgeAIService`:**
   - `loadModel(): Promise<void>` — loads the `.pte` model into memory; called once on app launch (deferred, after splash)
   - `scrubProfiles(profiles: ChildProfile[]): Promise<AnonymizedContext>` — takes active profiles, runs inference, returns anonymized tags

4. **Design the scrubbing prompt template:**
   ```
   You are a privacy assistant. Given these child profiles, strip all names and
   generate anonymous tags. Output only JSON.
   
   Input: [{"name": "Leo", "condition": "ASD"}, {"name": "Mia", "condition": "ALLERGY"}]
   Output: {"tags": ["[Child_A: ASD]", "[Child_B: ALLERGY]"], "mapping": {"Child_A": "Leo", "Child_B": "Mia"}}
   ```

5. **Implement the `PrivacyMap` type:**
   ```typescript
   interface PrivacyMap {
     tags: string[];           // e.g. ["[Child_A: ASD]"]
     mapping: Record<string, string>;  // { "Child_A": "Leo" }
   }
   ```

6. **Persist the mapping in session memory** (not to disk) so the UI can re-map tags back to names after the Gemini response arrives.

7. **Add a model-loading indicator** to the splash/startup sequence — a subtle progress bar under the app logo while the model initializes.

8. **Fallback strategy:** if ExecuTorch fails to load (unsupported device, insufficient RAM), fall back to a deterministic rule-based anonymizer (regex + incremental counter) so the app remains functional in all cases.

### Deliverable
Active child profiles are anonymized on-device before any cloud call. The `PrivacyMap` is available in memory for post-processing. The model loads silently in the background.

---

## Stage 8 — Cloud AI: Lesson Plan Generation (Gemini API)

**Goal:** Implement the full Gemini API integration that takes the anonymized context and returns a structured, curriculum-aligned lesson plan.

### Tasks

1. **Secure API key storage:**
   - Store the Gemini API key in `expo-secure-store` (never in source code or `app.json`)
   - First-launch setup flow: if no key is found, the Settings screen prompts the teacher to enter it
   - Validate the key format before storing

2. **Build the `GeminiService`:**
   - `generateLessonPlan(params: GenerationParams): Promise<LessonPlan>`
   - Uses `fetch` against the Gemini REST endpoint (`generativelanguage.googleapis.com`)
   - Timeout: 30 seconds; retry once on 5xx errors

3. **Design the full generation prompt structure:**
   ```
   You are an expert Polish preschool pedagogical assistant. Generate a detailed,
   chronological lesson plan for [DATE] for a group of children aged 3-6.
   
   Context:
   - Topic (optional): [TOPIC or "suggest a seasonal/holiday-appropriate topic"]
   - Season: [SEASON]
   - Special requirements in group: [ANONYMIZED_TAGS from ExecuTorch]
   - Polish Core Curriculum area: [randomly selected or topic-derived]
   
   Output a JSON object with this structure:
   {
     "suggestedTopic": "...",
     "activities": [
       {
         "title": "...",
         "durationMinutes": 20,
         "timeSlot": "08:00",
         "description": "...",
         "pedagogicalGoals": ["...", "..."],
         "curriculumPoints": ["4.1", "4.2"],
         "specialNeedsAdaptations": { "[Child_A: ASD]": "..." }
       }
     ]
   }
   ```

4. **Implement response parsing and validation:**
   - Parse the JSON response safely (try/catch)
   - Validate required fields; add fallback values for missing optional fields
   - Define `LessonPlan`, `Activity`, and related types in `src/types/`

5. **Implement the `PrivacyRemapper`:**
   - Walks the parsed `LessonPlan` object
   - Replaces all occurrences of `[Child_A]` with `"Leo"` (using the `PrivacyMap` from Stage 7)
   - Operates entirely client-side after the API response arrives

6. **Wire the full pipeline in `GenerationOrchestrator`:**
   ```
   getActiveProfiles()
     → EdgeAIService.scrubProfiles()     ← Stage 7
     → GeminiService.generateLessonPlan() ← this stage
     → PrivacyRemapper.remap()
     → DayPlanRepository.save()          ← Stage 6
     → navigate to Planned view          ← Stage 9
   ```

7. **Polish Core Curriculum reference data:**
   - Bundle a static JSON file `src/data/curriculum.json` containing the Polish Ministerstwo Edukacji Narodowej preschool core curriculum point identifiers and descriptions
   - Used to enrich the prompt and validate returned curriculum point codes

### Deliverable
End-to-end generation pipeline: tapping "Generate Lesson Plan" produces a real AI-generated, curriculum-aligned plan with anonymized profiles — and the result is saved to the local DB and displayed on-screen.

---

## Stage 9 — Day Plan: Planned View (Activity Cards)

**Goal:** Build the generated lesson plan display screen as seen in `designs/dayPlanPlanned.html`, with a chronological activity timeline and expandable pedagogical detail sections.

### Tasks

1. **Build the `DayPlanHeader`:**
   - Back button to Dashboard
   - Date display (day name + date)
   - Topic title (bold headline)
   - "Edit" / "Regenerate" action buttons (top-right)

2. **Build the `ActivityCard` component:**
   - Time-slot label (left, small, muted — e.g., "08:00")
   - Vertical timeline connector line between cards
   - Card body: white / `surface-container-lowest` background, `border-radius: 16`, subtle shadow
   - **Title row:** activity name (bold, `text-on-surface`) + duration chip (e.g., "20 min", `secondary-container` pill)
   - **Description section:** body text, Inter, readable line height
   - **Expandable accordion — "Pedagogical Goals":**
     - Collapsed by default
     - Header row: `pedagogy` / `school` icon + "Pedagogical Goals" label + `expand_more` chevron
     - Expands to show a bulleted list of goals
     - Smooth height animation using React Native Reanimated
   - **Expandable accordion — "Core Curriculum Points" (Punkty podstawy programowej):**
     - Same pattern as Pedagogical Goals
     - Each point shown as a code badge + description
     - Background: `secondary-fixed` light blue
   - **Special Needs Adaptations section** (only if profiles exist):
     - Shown as a distinct visual region inside the card
     - Uses the re-mapped real name (from PrivacyRemapper)
     - Color-coded by condition type (matches profile card colors from Stage 4)

3. **Build the `PlanTimeline`** — a scrollable `FlatList` of `ActivityCard` components ordered by `timeSlot`.

4. **Build fallback and loading states:**
   - `SkeletonCard` shown while the AI is generating (3 placeholder cards with shimmer animation)
   - `ErrorState` component if generation fails — with retry button

5. **Implement "Regenerate" action:**
   - Shows a confirmation bottom sheet ("This will replace the current plan")
   - On confirm, re-runs the pipeline from Stage 8 with the same date and topic

6. **Implement plan sharing/export (stub):**
   - "Share" action button that uses `expo-sharing` to export the plan as a plain-text or PDF summary
   - Full implementation deferred to a later enhancement

### Deliverable
A fully rendered, interactive day plan screen. Activity cards expand/collapse smoothly. All generated content (including child-specific adaptations with real names) is displayed correctly. Screen visually matches `dayPlanPlanned.html`.

---

## Stage 10 — Settings Screen & Language Selection

**Goal:** Build the Settings screen, add Polish/English language switching, and allow teachers to configure the AI environment.

### Tasks

1. **Build the Settings screen layout:**
   - Grouped list sections (`surface-container-lowest` cards with `border-radius: 16`)
   - Section headers in overline style

2. **Language selection:**
   - Segmented control or two-option radio list: 🇬🇧 English / 🇵🇱 Polski
   - Persisted via `AsyncStorage` or `expo-secure-store`
   - Implement `i18n-js` or `expo-localization` + a simple `translations/en.ts` and `translations/pl.ts`
   - All UI strings passed through the translation layer from this stage forward
   - Switching language re-renders the app immediately without restart

3. **Gemini API key configuration:**
   - Masked text input showing `••••••••` for a stored key
   - "Change Key" button — opens an edit modal
   - "Test Connection" button — makes a lightweight Gemini API call and shows success/error

4. **App preferences:**
   - "Default school day start time" — time picker (used as first activity slot)
   - "Age group" — 3–4 year olds / 4–5 / 5–6 — influences AI prompt complexity
   - "Include Core Curriculum codes in plan" — toggle (some teachers may not want codes shown in the UI)

5. **Privacy & Data section:**
   - "Clear all child profiles" — destructive action with confirmation alert
   - "Clear all saved plans" — destructive action with confirmation alert
   - "About GDPR compliance" — static info screen explaining data architecture (all data local, PII never sent to cloud)

6. **About section:**
   - App version, build number
   - "Open source licenses" link

### Deliverable
A complete Settings screen. Language switching works end-to-end (UI in PL or EN). API key is securely stored and testable. All preference values are persisted.

---

## Stage 11 — Polish, Animations & Accessibility

**Goal:** Elevate the app from functional to exceptional — add micro-interactions, transitions, loading states, and ensure full accessibility.

### Tasks

1. **Animated screen transitions:**
   - Slide-right transition from Dashboard → Day Plan
   - Fade transition between tab screens
   - Implemented via Expo Router's `<Stack>` animation config and Reanimated shared element primitives

2. **Calendar day press animation:**
   - Scale-down on press (`scale: 0.92`) with spring back
   - Ripple / highlight on today's date

3. **Skeleton loading screens:**
   - `SkeletonDashboard` — calendar grid and sidebar with shimmer animation
   - `SkeletonPlanView` — 3 activity card placeholders with shimmer

4. **Pull-to-refresh** on Dashboard and Profiles screens.

5. **Bottom sheet** for the "Add Child Profile" form (instead of full-screen navigation):
   - Uses `@gorhom/bottom-sheet` or `expo-modal-view`
   - Handles keyboard avoidance

6. **Haptic feedback** (iOS / Android) on:
   - Toggle activation (profiles screen)
   - "Generate Lesson Plan" button press
   - Plan save confirmation

7. **Accessibility:**
   - All interactive elements have `accessibilityLabel` and `accessibilityRole`
   - Color contrast ratios checked against WCAG AA for all text/background combinations in the design palette
   - Dynamic font size support (respects system accessibility font scale)
   - Screen reader order correct on all screens

8. **Error boundaries** — wraps each tab screen; shows a friendly error card instead of crashing.

### Deliverable
The app feels native, polished, and professional. Animations are smooth (60fps). All interactive elements are accessible to screen readers.

---

## Stage 12 — Testing, Security Audit & Release Preparation

**Goal:** Validate the full app against functional, security, and performance requirements before release.

### Tasks

1. **Unit tests** (`jest` + `@testing-library/react-native`):
   - `DatabaseService` migration runner (in-memory SQLite)
   - `ChildProfileRepository` CRUD operations
   - `PrivacyRemapper` — verifies no PII appears in Gemini payloads
   - `GeminiService` — mocked fetch, tests prompt construction and response parsing
   - Translation helper — ensures all keys exist in both `en.ts` and `pl.ts`

2. **Integration test for the full generation pipeline:**
   - Mock ExecuTorch and Gemini
   - Assert: no profile name appears in the outgoing Gemini request body
   - Assert: the returned plan contains real names (post-remap) in the UI layer
   - Assert: the resulting plan is correctly persisted and retrievable by date

3. **Security audit (OWASP alignment):**
   - API key stored in `expo-secure-store` (Keychain / Keystore), never in JS bundle or logs
   - No PII logged to console or crash reporting tools
   - SQLite file is excluded from iCloud/Google Drive backups (`NSURLIsExcludedFromBackupKey` on iOS)
   - Gemini API requests use HTTPS only; certificate pinning evaluated
   - Input fields sanitized before DB insertion (parameterized queries via Expo SQLite API)

4. **Performance profiling:**
   - Calendar renders with `useMemo` to avoid re-renders on unrelated state changes
   - `FlatList` for activity cards with `keyExtractor` and `removeClippedSubviews`
   - ExecuTorch model loaded once, not on every generation request

5. **Expo build configuration:**
   - Configure `app.json` with correct bundle identifier, version, icons, and splash screen
   - EAS Build profile for development, preview (internal distribution), and production
   - Environment variables for Gemini API key injection in CI (if used)

6. **Manual QA checklist:**
   - Calendar: month navigation, today highlight, dot indicators for saved plans
   - Profiles: add, edit, toggle active, delete
   - Generation: with and without topic, with 0 / 1 / 3 active profiles
   - Language switch: full app re-renders in Polish without restart
   - Offline mode: app works fully without network (SQLite, ExecuTorch); graceful error if Gemini unreachable

### Deliverable
Test suite passing. Security audit clean. App is ready for TestFlight / internal Android distribution.

---

## Cross-Cutting Concerns (applies to all stages)

| Concern | Approach |
|---|---|
| **GDPR / RODO** | No PII in cloud requests (enforced by Stage 7). SQLite file excluded from backups. Explicit consent copy on profiles screen. |
| **TypeScript** | Strict mode. All entities fully typed. No `any`. |
| **Error handling** | Every async operation wrapped in try/catch. User-facing error messages in both languages. |
| **State management** | React Context for theme and language. Local component state for UI. Repository pattern for DB access. No external state library needed. |
| **Code style** | Consistent file naming (`kebab-case`). Components in `src/components/`. Screens in `src/app/`. Types in `src/types/`. Services in `src/services/`. Data in `src/data/`. |

---

## Stage Summary

| # | Stage | Key Output |
|---|---|---|
| 1 | Design System & Foundation | Theme tokens, fonts, typography constants |
| 2 | App Shell & Navigation | Tab bar, header, Expo Router file structure |
| 3 | Dashboard Screen | Interactive calendar, tip card, pending tasks |
| 4 | Profiles Screen UI | Child profile cards, GDPR banner, add form |
| 5 | Day Plan — Unplanned View | Topic input, context card, generate CTA |
| 6 | Local Data Layer | SQLite schema, repositories, DB wired to UI |
| 7 | Edge AI — PII Scrubbing | ExecuTorch integration, anonymization pipeline |
| 8 | Cloud AI — Plan Generation | Gemini API, prompt engineering, privacy remapping |
| 9 | Day Plan — Planned View | Activity timeline cards, accordion sections |
| 10 | Settings & i18n | Language toggle (EN/PL), API key config, preferences |
| 11 | Polish & Accessibility | Animations, haptics, skeleton loaders, a11y |
| 12 | Testing & Release Prep | Unit/integration tests, security audit, EAS build |
