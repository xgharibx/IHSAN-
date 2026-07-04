# أكاديمية الإحسان (Ihsan Academy)

A premium intelligent learning platform built on the First, Second, Third, Fourth, Fifth, Sixth, Seventh, and Eighth Week of source materials (`First Week and Attachments` through `Eaith Week and Attachments`). Designed as the foundation of a multi-week academy (8 weeks total: 7 content weeks + 1 review week).

## Stack

- **Vite + React 18 + TypeScript** (`ihsan-academy-app/`)
- **Tailwind CSS** with RTL layout (Arabic-first)
- **Zustand + persist** for state
- **React Router v6** for routing
- **GSAP + ScrollTrigger** for animations
- **Gemini API** for AI tutor
- **Web Speech API** for Arabic STT/TTS

## Build / Test

```bash
cd ihsan-academy-app
npm install
npm run dev          # http://localhost:5173
npm run build        # Production build to ./dist
npm run typecheck    # tsc -b --noEmit
```

## Weeks Status

| Week | Title | Status |
|---|---|---|
| 1 | First Week | ✅ Complete (10 courses) |
| 2 | Second Week | ✅ Complete (10 courses) |
| 3 | Third Week | ✅ Complete (9 courses, seerah folded into seerah-app) |
| 4 | Fourth Week | ✅ Complete (10 courses) |
| 5 | Fifth Week | ✅ Complete (10 courses) |
| 6 | Sixth Week | ⚠️ Partial (1 course) |
| 7 | Seventh Week | ⚠️ Partial (8 courses) |
| 8 | Eaith Week | ⚠️ Partial (3 courses) |

## Deployment

The app is ready for Vercel deployment:

```bash
# From repo root
cd ihsan-academy-app
npm install
npm run build
# Deploy dist/ to Vercel
```

`vercel.json` is configured with SPA rewrites to `index.html`.

## Critical Invariants

- **RTL**: Arabic-first. `<html dir="rtl" lang="ar">` is set.
- **Multi-week data**: `src/data/index.ts` exports a `data.weeks` registry with all 8 weeks. Each is a self-contained bundle.
- **Active week**: `useWeekData()` hook reads `selectedWeek` from Zustand store and returns the current bundle.
- **Week switcher**: `Layout.tsx` shows all loaded weeks; unloaded weeks show as "قريبًا".
- **AI tutor**: `src/services/aiTutor.ts` has course-aware context injection + 10 specialized modes + citation tracking + memory.
- **Build knowledge base**: `buildKnowledgeBase()` in `index.ts` iterates over all 8 weeks for the AI tutor.

## Known Limitations

- Weeks 6, 7, 8 have fewer courses (1, 8, 3 respectively) because their source folders had empty subfolders.
- No automated tests; manual QA only.
- Vite warns about a 7.7MB bundle (gzipped 3.1MB) due to all data being statically imported.

## AI Tutor Modes

1. **علّمني** (Teach) — narrative storytelling explanation
2. **اسأل** (Ask) — accurate referenced answers
3. **اختبرني** (Quiz) — instant adaptive questions
4. **بسّط** (Simple) — beginner-friendly
5. **شرح معمّق** (Deep) — academic with references
6. **اربط** (Connect) — cross-domain bridges
7. **خطة** (Plan) — personalized study plans
8. **مراجعة** (Review) — condensed summaries
9. **تأمّل** (Reflect) — soul-questions
10. **اختبار** (Exam) — final integrated tests

## Local Fallback

When no Gemini API key is set (`VITE_GEMINI_API_KEY` in `.env`), the tutor uses a built-in fallback that draws from the same `knowledgeBaseText` and `keyTerms` fields.
