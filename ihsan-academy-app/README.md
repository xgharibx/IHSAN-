# أكاديمية الإحسان — Week 1

Premium intelligent learning platform for the Ihsan Academy, built as a foundation for a multi-week educational system. Week 1 (الأسابيع الأولى) is implemented now based on the `First Week and Attachments` folder.

## Quick start

```bash
cd "ihsan-academy-app"
npm install
npm run dev
# open http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

Typecheck only:

```bash
npm run typecheck
```

## Architecture

This is a **Vite + React 18 + TypeScript + TailwindCSS** application with:

- **React Router v6** for routing
- **Zustand + persist** for state management (progress, achievements, AI chat, notes)
- **GSAP + ScrollTrigger** for cinematic animations
- **Lenis** for smooth scrolling
- **Gemini AI** integration for the tutor (via REST API, no SDK dependency)

The whole UI is **RTL (Arabic-first)** and designed mobile-first.

## Folder structure

```
src/
├── App.tsx                  # router + smooth-scroll setup
├── main.tsx                 # entry
├── index.css                # Tailwind + design system
├── types/index.ts           # shared types
├── store/useStore.ts        # Zustand store with persistence
├── data/
│   ├── index.ts             # data access layer
│   ├── achievements.ts
│   └── week1/
│       ├── courses.ts       # 9 courses
│       ├── week1.index.json # week meta
│       ├── courses/         # one JSON per course
│       ├── concepts/        # cross-cutting concepts
│       ├── assessments/     # flashcards + quizzes
│       ├── activities/      # applied activities
│       ├── synthesis/       # cross-course map, weekly synthesis
│       ├── study-path.json
│       └── raw/             # extracted transcript text files
├── services/aiTutor.ts      # AI abstraction (Gemini) + local fallback
├── components/              # Layout, Icons, LoadingScreen
├── pages/                   # Home, Dashboard, CourseList, CourseDetail,
│                            # KnowledgeTree, Study, Activities, AiTutor,
│                            # Synthesis, Achievements, NotFound
└── lib/utils.ts
```

## Modules implemented

1. **Course Content Explanation Module** — 10 fully fleshed-out courses with summaries, deep sections, key terms, must-understand points, common mistakes, examples, reflection questions, quick revision, and detailed knowledge-base text used by the AI tutor. Some courses also ship optional richer content (phased deep-dive explanations, long summaries, study guides) that's auto-discovered by `src/data/week1/deepContent.ts`.
2. **Cross-Course Connection Module** — `KnowledgeTree` page with interactive visual map of courses + concepts + relationships. `Synthesis` page with the unified weekly explanation, key messages, and pre-Week-2 checklist.
3. **Study Guide & Assessment Module** — `Study` page with flashcards (flip), MCQ, true/false, fill-in-the-blank, matching, short-answer, scenario, and reflection questions, all with explanations, difficulty, and filtering.
4. **Activities, Timeline & Achievement Module** — `Activities` page with a 7-day timeline, per-day missions, an activity library, and 12 unlockable achievements.
5. **AI Tutor Module** — 10 modes (Teach, Ask, Quiz, Simple, Deep, Connect, Plan, Revise, Reflect, Exam). Calls Gemini's REST API with the full Week 1 knowledge base as context. Gracefully falls back to a local mini-tutor if `VITE_GEMINI_API_KEY` is not set.
6. **Future Weeks Scalability** — All data is keyed by week (`data.week1.courses`, etc.). To add Week 2, create `src/data/week2/` with the same structure and a parallel index module.

## Setting up the AI tutor

The app works **without an API key** using a small built-in local fallback. To enable real Gemini-powered answers:

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Copy `.env.example` to `.env`.
3. Add your key:
   ```
   VITE_GEMINI_API_KEY=AIza...
   VITE_GEMINI_MODEL=gemini-2.5-flash
   VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com
   ```
4. Restart the dev server.

The system prompt includes the full Week 1 knowledge base, the active mode instructions, and a guardrail: "If the answer is not in the materials, say so."

## Content inventory

The `First Week and Attachments` folder contains 9 course folders. The `src/data/week1/raw/` folder holds the extracted transcripts that the structured course JSONs were built from.

| Course folder                       | Course slug       | Topic                                              | Has transcript |
| ---------------------------------- | ----------------- | -------------------------------------------------- | -------------- |
| الاحسان ومنازل الروح                | `ihsan-soul`      | أنت الخليفة المسؤول عن الأرض                      | ✓              |
| التفسير                            | `tafsir`          | تفسير سورة الفاتحة                                 | ✓              |
| السيرة النبوية                      | `seerah`          | المخلوق الأعظم                                     | ✓              |
| صحابة رسول الله / الصحابة           | `sahaba`          | أبو بكر الصديق                                     | ✓              |
| صحابة رسول الله / الصحابيات         | `sahabiyyat`      | خديجة بنت خويلد                                    | ✓              |
| القضايا المعاصرة                    | `contemporary`    | الغزوة / السرية / الفتح / الجهاد                  | ✓              |
| تطبيقات السيرة                      | `seerah-app`      | تطبيقات عملية من السيرة                            | PDF only       |
| القواعد الفقهية                    | `fiqh-rules`      | الأمور بمقاصدها + النية                            | ✓              |
| تطبيقات منازل الروح والإحسان         | `soul-app`        | التوبة وعلاج الأمراض النفسية                       | ✓              |
| علم النفس الإيجابي                  | `positive-psych`  | الإحسان البعد الرابع                               | ✓              |

> Note: the actual `تطبيقات السيرة` folder ships with a PDF only. The `seerah-app` course is therefore built around the overlapping Ghazwa/Sariyya/Fath application material (whose transcript is in the `القضايا المعاصرة` folder), plus a derived synthesis on applying the Seerah in daily life.

## Design system

- **Theme**: deep ink-blue cosmic background with gold/emerald/rose accents. Subtle starfield animation.
- **Typography**: Amiri (Arabic serif), Tajawal (Arabic sans), Cormorant Garamond (display).
- **Components**: glassmorphism (`card` class), gradient buttons (`btn-primary`), soft shadows, motion-respecting (`prefers-reduced-motion`).
- **Animations**: GSAP hero fades, ScrollTrigger reveals, Lenis smooth scroll.

## Adding Week 2 (and beyond)

1. Create `src/data/week2/` mirroring `src/data/week1/`:
   - `week2.index.json`
   - `courses/*.json` (one per course)
   - `concepts/concepts.json`
   - `assessments/flashcards.json`, `quizzes.json`
   - `activities/activities.json`
   - `synthesis/week2-synthesis.json`
   - `study-path.json`
2. Create `src/data/week2/courses.ts` that re-exports the course list.
3. Extend `src/data/index.ts` to include `week2: { ... }` and add a unified `getCourseById(id)` that searches across all weeks.
4. Add a week selector in the layout.
5. (Optional) Link cross-week concepts in the knowledge map.

## Scripts

| Command            | Purpose                                |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Start dev server (http://localhost:5173) |
| `npm run build`    | Type-check + production build          |
| `npm run preview`  | Preview the production build           |
| `npm run typecheck`| TypeScript check only                  |

## License

Internal project. © أكاديمية الإحسان.
