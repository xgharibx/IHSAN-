# AGENTS.md — notes for future agents working in this repo

## Project: Ihsan Academy (أكاديمية الإحسان) — Week 1 foundation

A premium intelligent learning platform built from the `First Week and Attachments` folder. Designed as the foundation of a multi-week academy.

## Stack

- **Vite + React 18 + TypeScript** (`/ihsan-academy-app/`)
- **Tailwind CSS** with RTL layout (Arabic-first)
- **Zustand + persist** for state (`src/store/useStore.ts`)
- **React Router v6** for routing
- **GSAP + ScrollTrigger** + **Lenis** for animations
- **Gemini API** for AI tutor (`src/services/aiTutor.ts`) — no SDK, pure REST

## Build / test / lint

```bash
cd "ihsan-academy-app"
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run typecheck    # tsc -b --noEmit
```

There is **no** linter configured (no ESLint setup). `npm run build` runs `tsc -b` so a successful build implies typecheck passes.

## Critical invariants

- **RTL**: the app is Arabic-first. `<html dir="rtl" lang="ar">` is set in `index.html`. Do not remove.
- **Data structure**: courses are typed by `Course` interface in `src/types/index.ts`. The 10 courses live in `src/data/week1/courses/*.json` and are aggregated by `src/data/week1/courses.ts`.
- **Optional "deep content" files**: any course can ship extra, richer content as loose files directly under `src/data/week1/`, named `{courseId}.deep-explanation.json` (+ optional `.p1.json`...`.pN.json` phases), `{courseId}.long-summary.json`, `{courseId}.study-guide.json`, `{courseId}.concepts.json`, `{courseId}.flashcards.json`, `{courseId}.activities.json`. These are auto-discovered by `src/data/week1/deepContent.ts` via `import.meta.glob` and merged into the matching course automatically — **no code changes are needed** to wire up a new course's deep content, just add files following the naming convention. `deepContent.ts` also normalizes `{courseId}.flashcards.json` / `.activities.json` into the standard `Flashcard`/`Activity` shape and, in `src/data/index.ts`, those replace (not duplicate) the thinner pooled entries for that course. `CourseDetail.tsx` renders `course.deepConcepts`, `course.longSummary`, `course.deepExplanation`, `course.studyGuide` conditionally, so courses without these files are unaffected.
- **Zustand store** persists to `localStorage` under key `ihsan-academy-store`. Reset is via `useStore.resetAll()`.
- **AI tutor**: if `VITE_GEMINI_API_KEY` is missing, the tutor uses a built-in local fallback (defined in `aiTutor.ts`). The fallback is intentionally small and includes a banner telling the user to add a key.
- **Knowledge base text** for the AI tutor is built at runtime by `buildKnowledgeBase()` in `src/data/index.ts` — adding a new course updates it automatically.

## Things future agents should know

- **All content is in Arabic.** Preserve Arabic strings exactly; do not transliterate to Latin.
- **No secrets in the repo.** API key comes from `.env` (use `.env.example` for the template). `.env` is gitignored.
- **Course `knowledgeBaseText`** is the source of truth for the AI tutor. It must be a faithful, non-hallucinated summary of the source transcript. When in doubt, leave it short but accurate.
- **Adding weeks**: copy `src/data/week1/` to `src/data/week2/` and add a key in `src/data/index.ts`. The knowledge map and synthesis pages reference `data.week1.*` directly — generalize them to `data[currentWeek].*` if you add more weeks.
- **Animations**: respect `prefers-reduced-motion`. CSS class `reveal` + ScrollTrigger handles section reveals. Do not add heavy 3D unless absolutely necessary.
- **Performance**: lazy-load all pages with `React.lazy` (already done in `App.tsx`). Keep `lenis` smooth scroll on globally.
- **File uploads in the future**: `course.files[]` in each course JSON describes the original materials (PDF/PPTX/TXT). The web app doesn't render them inline — they're listed under "المواد المرفقة".

## Layout map

- `Layout.tsx` — header + footer + nav
- `pages/Home.tsx` — landing page with hero, course grid, modules overview
- `pages/Dashboard.tsx` — weekly dashboard, KPIs, course progress, pre-Week-2 checklist
- `pages/CourseList.tsx` — list of all 10 courses
- `pages/CourseDetail.tsx` — single course: summary/deep mode, sections, key terms, must-understand, common mistakes, examples, reflection, related courses, plus optional deep-content sections (deep concepts, long summary, phased deep-dive, study guide) when a course ships them (see deepContent.ts above)
- `pages/KnowledgeTree.tsx` — interactive visual map of courses + concepts
- `pages/Study.tsx` — flashcards (flip), 8 quiz types, filters
- `pages/Activities.tsx` — 7-day timeline + activity library
- `pages/AiTutor.tsx` — 10 modes, course selector, chat history
- `pages/Synthesis.tsx` — unified weekly explanation, key messages, pre-Week-2 checklist
- `pages/Achievements.tsx` — 12 unlockable achievements

## Known limitations

- `تطبيقات السيرة` folder ships PDF-only. The `seerah-app` course reuses the Ghazwa/Sariyya transcript (in `القضايا المعاصة`) and adds a synthesized "applied seerah" layer. If you can parse the PDF later, expand `knowledgeBaseText` and the sections.
- The `i18n` for English is not implemented. UI strings are hard-coded Arabic.
- Some `course.relatedConcepts` / `concept.relatedConceptIds` / `*.relatedConcepts` (on flashcards) reference concept ids that don't exist in `concepts/concepts.json` (e.g. "iman", "ibadah", "taqwa"). This is pre-existing and harmless today — nothing in the UI dereferences those arrays to look up concept objects (`KnowledgeTree.tsx` uses its own separate `synthesis/cross-course-map.json` nodes/edges) — but if you add a feature that resolves these ids, add the missing concepts first. Likewise, a few `quizRefs.itemIds` don't resolve to an actual item in `assessments/quizzes.json`; also unused today.
- The AI tutor's local fallback is small. For best experience, set `VITE_GEMINI_API_KEY` in `.env`.
- No automated tests. Manual QA only (visual + content review).
