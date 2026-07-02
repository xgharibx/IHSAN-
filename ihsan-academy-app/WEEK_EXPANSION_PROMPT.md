# Ihsan Academy — Week Expansion Prompt (reusable template)

> **How to use this file:** Copy everything in the fenced block below into a new
> chat with your coding AI agent. Before sending, replace the two placeholders
> at the very top (`[[WEEK_NUMBER]]` and `[[WEEK_FOLDER_NAME]]`) with the real
> values for the week you're adding. That is the **only** thing you need to
> change each time — the rest of the prompt is fully generic and mirrors
> exactly how Week 1 was built.
>
> **Folder naming pattern** (confirm the exact folder name exists before
> sending — rename if needed so it matches):
> | Week | Folder name |
> |------|-------------|
> | 1 | `First Week and Attachments` (done) |
> | 2 | `Second Week and Attachments` |
> | 3 | `Third Week and Attachments` |
> | 4 | `Fourth Week and Attachments` |
> | 5 | `Fifth Week and Attachments` |
> | 6 | `Sixth Week and Attachments` |
> | 7 | `Seventh Week and Attachments` |
> | 8 | `Revision Week and Attachments` (confirm — this is the revision week, may contain no new transcripts, only review/synthesis material across weeks 1–7) |

---

## PROMPT TO COPY (starts below this line)

```
You are continuing development on "Ihsan Academy" (أكاديمية الإحسان), a
Vite + React 18 + TypeScript + Tailwind CSS, Arabic-RTL, multi-week Islamic
e-learning platform, located at the workspace root `ihsan-academy-app/`.

Week 1 (of 8 total: 7 content weeks + 1 revision week) has already been built
completely and is the reference implementation for everything you are about
to do. Your job in this session is to build out **Week [[WEEK_NUMBER]]**,
using the raw source materials (lecture transcripts, PDFs, PPTX, etc.) found
in the folder named exactly:

  "[[WEEK_FOLDER_NAME]]"

This folder sits at the same level as the "First Week and Attachments" folder
did — inspect the workspace root to find it. Do NOT invent or hallucinate any
content. Every fact, quote, definition, and example you write must be
traceable to the actual source materials in that folder. If something is
ambiguous, incomplete, PDF-only with no extractable text, or you are unsure
which course a file belongs to, STOP and ask me a clarifying question rather
than guessing.

=====================================================================
PHASE 0 — READ THIS ENTIRE PROMPT FIRST, THEN STUDY BEFORE WRITING CODE
=====================================================================
Before touching any file, thoroughly study the existing implementation so
your output matches its conventions exactly:

1. Read `ihsan-academy-app/AGENTS.md` in full — it documents the data
   architecture, invariants, and known limitations.
2. Read `ihsan-academy-app/src/types/index.ts` in full — every TypeScript
   interface you must populate (Course, KeyTerm, LessonSection, StudyGuide,
   CourseDeepDive, DeepDiveExplanation, DeepDivePhase, CourseLongSummary,
   LongSummarySection, ConceptDeep, Flashcard, Activity, Achievement,
   AnyQuestion/MCQ/TrueFalse/FillBlank/MatchQuestion/ShortAnswer, WeekMeta,
   StudyPath, Concept, SynthesisNode/SynthesisEdge).
3. Read `ihsan-academy-app/src/data/week1/` end-to-end as your reference:
   - `courses/*.json` (10 base course files)
   - `deepContent.ts` (the auto-discovery glob system — understand it fully)
   - the loose `{courseId}.deep-explanation.json` (+ `.p1.json`..`.pN.json`),
     `{courseId}.long-summary.json`, `{courseId}.study-guide.json`,
     `{courseId}.concepts.json`, `{courseId}.flashcards.json`,
     `{courseId}.activities.json` files directly under `src/data/week1/`
   - `assessments/quizzes.json`, `assessments/flashcards.json`,
     `activities/activities.json`, `concepts/concepts.json`
   - `synthesis/week1-synthesis.json`, `synthesis/cross-course-map.json`
   - `week1.index.json`, `study-path.json`, `achievements.json`
   - `src/data/index.ts` (how everything is aggregated + `buildKnowledgeBase()`
     for the AI tutor) and `src/data/achievements.ts`
4. Open the actual "First Week and Attachments" folder and compare its raw
   transcripts against the resulting JSON so you understand the expected
   depth, tone, and fidelity (how much detail per course, how quotes are
   captured, how phases/sections are split).
5. Skim every page component that reads course data: `Home.tsx`,
   `Dashboard.tsx`, `CourseList.tsx`, `CourseDetail.tsx`, `Study.tsx`,
   `Activities.tsx`, `AiTutor.tsx`, `KnowledgeTree.tsx`, `Synthesis.tsx`,
   `Achievements.tsx`, and `components/Layout.tsx`.
6. Note current known-good conventions already fixed in the codebase that
   you must follow (do not regress them):
   - Every responsive Tailwind grid needs an explicit base, e.g.
     `grid grid-cols-1 gap-4 lg:grid-cols-3` — never just `grid gap-4 lg:grid-cols-3`
     (a missing base causes real mobile horizontal-overflow bugs).
   - Any flex row with a truncated text child needs `min-w-0` (and `flex-1`
     if it should grow) on the wrapping flex item, plus `shrink-0` on
     fixed-size siblings (icons/badges), or truncation silently fails.
   - Never animate `opacity` in mount-time GSAP `.from()` reveal tweens
     (React StrictMode double-invoke can leave content stuck invisible) —
     only animate `transform`.
   - The AI tutor (`src/services/aiTutor.ts`) already uses
     `thinkingConfig: { thinkingBudget: 0 }` and streaming — do not remove
     this; it is required for fast, complete Gemini responses.
   - Lenis smooth-scroll has been intentionally removed app-wide (caused a
     scrollbar-desync bug) — do not reintroduce it.
   - `relatedConcepts`/`relatedConceptIds`/`quizRefs.itemIds` must resolve to
     REAL ids that actually exist in the pools you create this session —
     Week 1 shipped with some pre-existing dangling ids; do not repeat that
     mistake for this week's own content.

Only after you have done the above, produce a short written plan mapping
every raw file in "[[WEEK_FOLDER_NAME]]" to a course id/slug/title before
proceeding to Phase 1. Post that mapping so I can sanity-check it if needed,
then continue.

=====================================================================
WORK IN EXACTLY 15 PHASES
=====================================================================
Complete each phase fully — including running `npm run typecheck` and
`npm run build` inside `ihsan-academy-app/` — before starting the next one.
After each phase, report a short status update (what changed, what verified,
what's next) so the work can be safely resumed if this session is
interrupted. Do not try to do everything in one giant edit.

PHASE 1 — Orientation & transcript-to-course mapping (see Phase 0 above).
  Deliverable: a written list of courses for this week (id, slug, Arabic
  title, subtitle, source folder/file(s), speaker if identifiable, domain).

PHASE 2 — One-time multi-week architecture generalization (CONDITIONAL).
  Check whether `src/data/index.ts` already supports multiple weeks via a
  `data.weeks[weekId]` (or equivalent) registry, a working week switcher in
  `Layout.tsx`'s header, and a dynamic "N / 8" indicator (instead of the
  original hardcoded "1 / 4"). If this generalization has NOT been done yet
  (i.e., this is the first run after Week 1), do it now, carefully and
  incrementally, verifying typecheck/build after each step:
    - Add a `data.weeks: Record<string, WeekBundle>` registry in
      `src/data/index.ts` (keep a `week1` entry pointing at the existing
      data so nothing regresses), where `WeekBundle` is the same shape
      currently under `data.week1` (meta, courses, flashcards, quizzes,
      activities, concepts, synthesis, knowledgeMap, studyPath).
    - The Zustand store (`src/store/useStore.ts`) already has a scaffolded
      but unused `selectedWeek` / `setSelectedWeek` — wire it up as the
      single source of truth for "which week is currently being viewed".
    - Add a week switcher control in `Layout.tsx`'s header (near the
      week badge) that lets the user pick any week that has data available;
      weeks without data yet should show as locked/disabled with a
      "قريبًا" (coming soon) label, not throw errors.
    - Replace every hardcoded `data.week1.X` reference across ALL pages
      (`Home.tsx`, `Dashboard.tsx`, `CourseList.tsx`, `CourseDetail.tsx`,
      `Study.tsx`, `Activities.tsx`, `AiTutor.tsx`, `KnowledgeTree.tsx`,
      `Synthesis.tsx`, `Achievements.tsx`, `Layout.tsx`) with a lookup
      through the active/selected week (e.g. a small `useWeekData()` hook
      returning `data.weeks[selectedWeek]`, falling back sanely if a week
      isn't loaded yet).
    - Update the footer "قريبًا" roadmap text and the header ratio badge to
      reflect the real curriculum: 7 content weeks + 1 revision week = 8
      weeks total (not the old placeholder "1 / 4").
    - Generalize `src/data/achievements.ts` (currently hardcoded to
      `week1/achievements.json`) to merge achievements across all loaded
      weeks, or scope them per week — pick whichever keeps `Achievements.tsx`
      working without duplicate ids.
    - Ensure course `id`s stay globally unique across weeks (Zustand
      progress/achievements are keyed by course id) — if this week's
      transcripts would naturally produce an id collision with an existing
      week's course, disambiguate (e.g. distinct slugs).
  If this generalization was ALREADY completed in a previous run for an
  earlier week, skip all of the above and just add this week's entry into
  the existing registry/switcher in Phase 12 below.

PHASE 3 — Scaffold this week's data folder.
  Create `src/data/week[[WEEK_NUMBER]]/` mirroring `week1/`'s exact folder
  structure: `courses/`, `assessments/`, `activities/`, `concepts/`,
  `synthesis/`, plus top-level `week[[WEEK_NUMBER]].index.json`,
  `study-path.json`, `achievements.json`, and a `deepContent.ts` (or reuse/
  generalize the existing one to accept a week path parameter instead of
  duplicating it — prefer generalizing over copy-pasting).

PHASE 4 — Full inventory of "[[WEEK_FOLDER_NAME]]".
  List every file, note which are transcripts (.txt), slides (.pptx), PDFs,
  images, etc. Confirm final course list and folder-to-course mapping
  (matches `Course.folderName`). If any course folder only has a PDF with no
  extractable text (like `seerah-app` in Week 1), note that as a limitation
  rather than fabricating content, and ask me how to proceed.

PHASE 5 — Author base `courses/*.json` for every course this week.
  One JSON per course, matching the `Course` interface exactly: id, slug,
  title, subtitle, domain, iconKey, folderName, speaker, duration, files,
  tagline, heroQuote, learningObjectives, outcomes, summary, sections
  (with real quotes/sources from the transcript), keyTerms, mustUnderstand,
  commonMistakes, realLifeExamples, reflectionQuestions, quickRevision,
  relatedCourses, relatedConcepts, quizRefs, flashcardIds, activityIds,
  knowledgeBaseText (the AI tutor's ground truth — must be faithful and
  non-hallucinated), scrollColor, accentGradient. Match Week 1's depth/tone.

PHASE 6 — Author deep-content files per course.
  For each course, add (as loose files directly under
  `src/data/week[[WEEK_NUMBER]]/`, following the EXACT naming convention so
  the glob auto-discovers them, same as Week 1):
    `{courseId}.deep-explanation.json` (+ `.p1.json`..`.pN.json` phases)
    `{courseId}.long-summary.json`
    `{courseId}.study-guide.json`
    `{courseId}.concepts.json`
    `{courseId}.flashcards.json`
    `{courseId}.activities.json`
  No code changes should be required for these to appear — only the
  `deepContent.ts`/`data/index.ts` code from Phase 2/3 needs to know about
  this week's folder path.

PHASE 7 — Build the pooled assessment/activity/flashcard files.
  `assessments/quizzes.json` (all 8 question types: mcq, tf, fitb, match,
  short, scenario, reflect, explain — spread across courses and difficulty
  levels), `assessments/flashcards.json`, `activities/activities.json` for
  any course NOT already fully covered by its own dedicated deep files from
  Phase 6 (dedicated files REPLACE, not duplicate, the pooled entry for that
  course — same merge rule as Week 1).

PHASE 8 — Build `concepts/concepts.json` (week-level concept pool).
  Every `relatedCourseIds`/`relatedConceptIds` reference must resolve to a
  real id that exists in this week's pool — verify this explicitly, don't
  assume.

PHASE 9 — Build `synthesis/week[[WEEK_NUMBER]]-synthesis.json`.
  bigIdea, integratedExplanation (a short faithful paragraph per course
  tying back to the big idea), keyMessages (bullet list), and a
  "beforeNextWeek" checklist (or "beforeGraduation" wording if this is the
  Week 8 revision week).

PHASE 10 — Build `synthesis/cross-course-map.json` (Knowledge Tree data).
  Nodes (course + concept nodes) with `x`/`y` in the 0..1 range and a
  distinct `color` per course, edges with meaningful labels connecting
  related courses/concepts. Double check edges don't get visually clipped
  at the container border (Week 1 fixed this via a coordinate remap in
  `KnowledgeTree.tsx` — reuse that same remap logic, don't reintroduce the
  clipping bug).

PHASE 11 — Build `week[[WEEK_NUMBER]].index.json`, `study-path.json`,
  `achievements.json`.
  `week[[WEEK_NUMBER]].index.json` = WeekMeta shape (id, number, title,
  subtitle, bigIdea, orderedCourseIds, themes). `study-path.json` = a
  recommended sequential path through this week's courses with realistic
  `estimatedMinutes`. `achievements.json` = new unlockable achievements tied
  to this week's courses/quizzes/activities (avoid id collisions with
  existing weeks' achievement ids).

PHASE 12 — Wire everything into the data layer.
  Register this week in the `data.weeks` registry (or week-agnostic
  equivalent from Phase 2), update the week switcher so it's selectable, and
  verify `buildKnowledgeBase()` (or its generalized multi-week equivalent)
  includes this week's content fully and accurately for the AI tutor.

PHASE 13 — Populate cross-course "connections" for real.
  Go back through every course JSON from Phase 5 and fill in accurate
  `relatedCourses`, `relatedConcepts`, `quizRefs.itemIds`, `flashcardIds`,
  `activityIds` — every single one of these must resolve to an id that
  actually exists in the pools you built. Grep-verify this, don't eyeball it.

PHASE 14 — Full technical verification.
  1. `npm run typecheck` and `npm run build` inside `ihsan-academy-app/` —
     both must be clean.
  2. Write a quick throwaway Node validation script (outside the repo, e.g.
     in a temp dir) that: globs all new deep-content files, checks every
     course has full coverage of the 6 file kinds (or documents which are
     intentionally missing and why), checks for duplicate ids across the
     pooled flashcards/activities/quizzes/concepts/achievements arrays.
  3. Start the dev server and visually/functionally verify, at both a
     normal desktop width AND a 390px-wide mobile viewport, for THIS week:
     Home, Dashboard, CourseList, every CourseDetail tab for every course,
     Study (flashcards + all quiz types), Activities, AiTutor (course
     selector + at least one real streamed response referencing this
     week's content), KnowledgeTree, Synthesis, Achievements.
  4. At the 390px viewport, explicitly check
     `document.documentElement.scrollWidth` equals `clientWidth` on every
     page (no horizontal overflow regressions) using the same method
     documented in `AGENTS.md`/repo notes.

PHASE 15 — Wrap-up.
  Update `ihsan-academy-app/AGENTS.md` with anything week-specific future
  agents should know (mirroring its existing "Known limitations" style —
  e.g. any course with PDF-only source, any deliberately-simplified content,
  any new achievement ids, any architecture change made in Phase 2). Give me
  a final concise summary: courses added, counts (flashcards/quizzes/
  activities/concepts/achievements), any content-accuracy issues you found
  and fixed (like the Week 1 positive-psych mismatch — always cross-check
  fresh transcript-grounded content against any pre-existing assumptions),
  and confirmation that typecheck/build/mobile-QA all pass.

=====================================================================
HARD RULES (apply to every phase)
=====================================================================
- All content must be in Arabic, preserved exactly as spoken/written in the
  source material — do not transliterate or invent phrasing.
- Never hallucinate Quranic verses, hadith, or quotes — only use what
  appears in the actual transcript, cited as it appears there.
- This is a single existing app, not a new project — do not scaffold a new
  Vite app, do not introduce a new UI framework/design system, reuse
  existing components/pages/styles exactly.
- No secrets in the repo; `.env` stays gitignored; do not touch the existing
  `VITE_GEMINI_API_KEY` handling.
- RTL Arabic-first (`<html dir="rtl" lang="ar">`) must be preserved.
- If uncertain about anything (ambiguous speaker, unclear course boundary,
  missing transcript, conflicting information), stop and ask me rather than
  guessing.
```

## PROMPT TO COPY (ends above this line)
