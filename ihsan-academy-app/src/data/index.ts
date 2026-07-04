// Data access layer — central place to import all week data
// Multi-week registry: each week is a self-contained bundle with the same shape.
// The active week is selected by `selectedWeek` in the Zustand store.

import week1Courses from "./week1/courses";
import week1FlashcardsPool from "./week1/assessments/flashcards.json";
import week1Quizzes from "./week1/assessments/quizzes.json";
import week1ActivitiesPool from "./week1/activities/activities.json";
import week1Meta from "./week1/week1.index.json";
import week1Concepts from "./week1/concepts/concepts.json";
import week1Synthesis from "./week1/synthesis/week1-synthesis.json";
import week1KnowledgeMap from "./week1/synthesis/cross-course-map.json";
import week1StudyPath from "./week1/study-path.json";
import week1Achievements from "./week1/achievements.json";
import {
  buildDeepActivityPool as buildWeek1DeepActivityPool,
  buildDeepFlashcardPool as buildWeek1DeepFlashcardPool,
  deepActivityCourseIds as week1DeepActivityCourseIds,
  deepFlashcardCourseIds as week1DeepFlashcardCourseIds,
} from "./week1/deepContent";

import week2Courses from "./week2/courses";
import week2FlashcardsPool from "./week2/assessments/flashcards.json";
import week2Quizzes from "./week2/assessments/quizzes.json";
import week2ActivitiesPool from "./week2/activities/activities.json";
import week2Meta from "./week2/week2.index.json";
import week2Concepts from "./week2/concepts/concepts.json";
import week2Synthesis from "./week2/synthesis/week2-synthesis.json";
import week2KnowledgeMap from "./week2/synthesis/cross-course-map.json";
import week2StudyPath from "./week2/study-path.json";
import week2Achievements from "./week2/achievements.json";
import {
  buildDeepActivityPool as buildWeek2DeepActivityPool,
  buildDeepFlashcardPool as buildWeek2DeepFlashcardPool,
  deepActivityCourseIds as week2DeepActivityCourseIds,
  deepFlashcardCourseIds as week2DeepFlashcardCourseIds,
} from "./week2/deepContent";

import week3Courses from "./week3/courses";
import week3FlashcardsPool from "./week3/assessments/flashcards.json";
import week3Quizzes from "./week3/assessments/quizzes.json";
import week3ActivitiesPool from "./week3/activities/activities.json";
import week3Meta from "./week3/week3.index.json";
import week3Concepts from "./week3/concepts/concepts.json";
import week3Synthesis from "./week3/synthesis/week3-synthesis.json";
import week3KnowledgeMap from "./week3/synthesis/cross-course-map.json";
import week3StudyPath from "./week3/study-path.json";
import week3Achievements from "./week3/achievements.json";
import {
  buildDeepActivityPool as buildWeek3DeepActivityPool,
  buildDeepFlashcardPool as buildWeek3DeepFlashcardPool,
  deepActivityCourseIds as week3DeepActivityCourseIds,
  deepFlashcardCourseIds as week3DeepFlashcardCourseIds,
} from "./week3/deepContent";

import week4Courses from "./week4/courses";
import week4FlashcardsPool from "./week4/assessments/flashcards.json";
import week4Quizzes from "./week4/assessments/quizzes.json";
import week4ActivitiesPool from "./week4/activities/activities.json";
import week4Meta from "./week4/week4.index.json";
import week4Concepts from "./week4/concepts/concepts.json";
import week4Synthesis from "./week4/synthesis/week4-synthesis.json";
import week4KnowledgeMap from "./week4/synthesis/cross-course-map.json";
import week4StudyPath from "./week4/study-path.json";
import week4Achievements from "./week4/achievements.json";
import {
  buildDeepActivityPool as buildWeek4DeepActivityPool,
  buildDeepFlashcardPool as buildWeek4DeepFlashcardPool,
  deepActivityCourseIds as week4DeepActivityCourseIds,
  deepFlashcardCourseIds as week4DeepFlashcardCourseIds,
} from "./week4/deepContent";

import week5Courses from "./week5/courses";
import week5FlashcardsPool from "./week5/assessments/flashcards.json";
import week5Quizzes from "./week5/assessments/quizzes.json";
import week5ActivitiesPool from "./week5/activities/activities.json";
import week5Meta from "./week5/week5.index.json";
import week5Concepts from "./week5/concepts/concepts.json";
import week5Synthesis from "./week5/synthesis/week5-synthesis.json";
import week5KnowledgeMap from "./week5/synthesis/cross-course-map.json";
import week5StudyPath from "./week5/study-path.json";
import week5Achievements from "./week5/achievements.json";
import {
  buildDeepActivityPool as buildWeek5DeepActivityPool,
  buildDeepFlashcardPool as buildWeek5DeepFlashcardPool,
  deepActivityCourseIds as week5DeepActivityCourseIds,
  deepFlashcardCourseIds as week5DeepFlashcardCourseIds,
} from "./week5/deepContent";

import week6Courses from "./week6/courses";
import week6FlashcardsPool from "./week6/assessments/flashcards.json";
import week6Quizzes from "./week6/assessments/quizzes.json";
import week6ActivitiesPool from "./week6/activities/activities.json";
import week6Meta from "./week6/week6.index.json";
import week6Concepts from "./week6/concepts/concepts.json";
import week6Synthesis from "./week6/synthesis/week6-synthesis.json";
import week6KnowledgeMap from "./week6/synthesis/cross-course-map.json";
import week6StudyPath from "./week6/study-path.json";
import week6Achievements from "./week6/achievements.json";
import {
  buildDeepActivityPool as buildWeek6DeepActivityPool,
  buildDeepFlashcardPool as buildWeek6DeepFlashcardPool,
  deepActivityCourseIds as week6DeepActivityCourseIds,
  deepFlashcardCourseIds as week6DeepFlashcardCourseIds,
} from "./week6/deepContent";

import week7Courses from "./week7/courses";
import week7FlashcardsPool from "./week7/assessments/flashcards.json";
import week7Quizzes from "./week7/assessments/quizzes.json";
import week7ActivitiesPool from "./week7/activities/activities.json";
import week7Meta from "./week7/week7.index.json";
import week7Concepts from "./week7/concepts/concepts.json";
import week7Synthesis from "./week7/synthesis/week7-synthesis.json";
import week7KnowledgeMap from "./week7/synthesis/cross-course-map.json";
import week7StudyPath from "./week7/study-path.json";
import week7Achievements from "./week7/achievements.json";
import {
  buildDeepActivityPool as buildWeek7DeepActivityPool,
  buildDeepFlashcardPool as buildWeek7DeepFlashcardPool,
  deepActivityCourseIds as week7DeepActivityCourseIds,
  deepFlashcardCourseIds as week7DeepFlashcardCourseIds,
} from "./week7/deepContent";

import week8Courses from "./week8/courses";
import week8FlashcardsPool from "./week8/assessments/flashcards.json";
import week8Quizzes from "./week8/assessments/quizzes.json";
import week8ActivitiesPool from "./week8/activities/activities.json";
import week8Meta from "./week8/week8.index.json";
import week8Concepts from "./week8/concepts/concepts.json";
import week8Synthesis from "./week8/synthesis/week8-synthesis.json";
import week8KnowledgeMap from "./week8/synthesis/cross-course-map.json";
import week8StudyPath from "./week8/study-path.json";
import week8Achievements from "./week8/achievements.json";
import {
  buildDeepActivityPool as buildWeek8DeepActivityPool,
  buildDeepFlashcardPool as buildWeek8DeepFlashcardPool,
  deepActivityCourseIds as week8DeepActivityCourseIds,
  deepFlashcardCourseIds as week8DeepFlashcardCourseIds,
} from "./week8/deepContent";

import type {
  Course,
  Flashcard,
  AnyQuestion,
  Activity,
  Achievement,
  WeekMeta,
  Concept,
} from "@/types";

export interface WeekBundle {
  meta: WeekMeta;
  courses: Course[];
  flashcards: Flashcard[];
  quizzes: AnyQuestion[];
  activities: Activity[];
  concepts: Concept[];
  synthesis: any;
  knowledgeMap: any;
  studyPath: any;
  achievements: Achievement[];
}

function buildWeekBundle(
  courses: Course[],
  flashcardsPool: Flashcard[],
  quizzes: AnyQuestion[],
  activitiesPool: Activity[],
  meta: WeekMeta,
  concepts: Concept[],
  synthesis: any,
  knowledgeMap: any,
  studyPath: any,
  achievements: Achievement[],
  deepFlashcardIds: Set<string>,
  deepActivityIds: Set<string>,
  buildDeepFlashcards: () => Flashcard[],
  buildDeepActivities: () => Activity[],
): WeekBundle {
  const mergedFlashcards: Flashcard[] = [
    ...flashcardsPool.filter((f) => !deepFlashcardIds.has(f.courseId)),
    ...buildDeepFlashcards(),
  ];
  const mergedActivities: Activity[] = [
    ...activitiesPool.filter((a) => !deepActivityIds.has(a.courseId)),
    ...buildDeepActivities(),
  ];
  return {
    meta,
    courses,
    flashcards: mergedFlashcards,
    quizzes,
    activities: mergedActivities,
    concepts,
    synthesis,
    knowledgeMap,
    studyPath,
    achievements,
  };
}

const week1Bundle: WeekBundle = buildWeekBundle(
  week1Courses as Course[],
  week1FlashcardsPool as Flashcard[],
  week1Quizzes as AnyQuestion[],
  week1ActivitiesPool as Activity[],
  week1Meta as WeekMeta,
  week1Concepts as Concept[],
  week1Synthesis,
  week1KnowledgeMap,
  week1StudyPath,
  week1Achievements as Achievement[],
  week1DeepFlashcardCourseIds,
  week1DeepActivityCourseIds,
  buildWeek1DeepFlashcardPool,
  buildWeek1DeepActivityPool,
);

const week2Bundle: WeekBundle = buildWeekBundle(
  week2Courses as Course[],
  week2FlashcardsPool as Flashcard[],
  week2Quizzes as AnyQuestion[],
  week2ActivitiesPool as Activity[],
  week2Meta as WeekMeta,
  week2Concepts as Concept[],
  week2Synthesis,
  week2KnowledgeMap,
  week2StudyPath,
  week2Achievements as Achievement[],
  week2DeepFlashcardCourseIds,
  week2DeepActivityCourseIds,
  buildWeek2DeepFlashcardPool,
  buildWeek2DeepActivityPool,
);

const week3Bundle: WeekBundle = buildWeekBundle(
  week3Courses as Course[],
  week3FlashcardsPool as Flashcard[],
  week3Quizzes as AnyQuestion[],
  week3ActivitiesPool as Activity[],
  week3Meta as WeekMeta,
  week3Concepts as Concept[],
  week3Synthesis,
  week3KnowledgeMap,
  week3StudyPath,
  week3Achievements as Achievement[],
  week3DeepFlashcardCourseIds,
  week3DeepActivityCourseIds,
  buildWeek3DeepFlashcardPool,
  buildWeek3DeepActivityPool,
);

const week4Bundle: WeekBundle = buildWeekBundle(
  week4Courses as Course[],
  week4FlashcardsPool as Flashcard[],
  week4Quizzes as AnyQuestion[],
  week4ActivitiesPool as Activity[],
  week4Meta as WeekMeta,
  week4Concepts as Concept[],
  week4Synthesis,
  week4KnowledgeMap,
  week4StudyPath,
  week4Achievements as Achievement[],
  week4DeepFlashcardCourseIds,
  week4DeepActivityCourseIds,
  buildWeek4DeepFlashcardPool,
  buildWeek4DeepActivityPool,
);

const week5Bundle: WeekBundle = buildWeekBundle(
  week5Courses as Course[],
  week5FlashcardsPool as unknown as Flashcard[],
  week5Quizzes as AnyQuestion[],
  week5ActivitiesPool as unknown as Activity[],
  week5Meta as WeekMeta,
  week5Concepts as Concept[],
  week5Synthesis,
  week5KnowledgeMap,
  week5StudyPath,
  week5Achievements as unknown as Achievement[],
  week5DeepFlashcardCourseIds,
  week5DeepActivityCourseIds,
  buildWeek5DeepFlashcardPool,
  buildWeek5DeepActivityPool,
);

const week6Bundle: WeekBundle = buildWeekBundle(
  week6Courses as Course[],
  week6FlashcardsPool as unknown as Flashcard[],
  week6Quizzes as AnyQuestion[],
  week6ActivitiesPool as unknown as Activity[],
  week6Meta as WeekMeta,
  week6Concepts as Concept[],
  week6Synthesis,
  week6KnowledgeMap,
  week6StudyPath,
  week6Achievements as unknown as Achievement[],
  week6DeepFlashcardCourseIds,
  week6DeepActivityCourseIds,
  buildWeek6DeepFlashcardPool,
  buildWeek6DeepActivityPool,
);

const week7Bundle: WeekBundle = buildWeekBundle(
  week7Courses as Course[],
  week7FlashcardsPool as unknown as Flashcard[],
  week7Quizzes as AnyQuestion[],
  week7ActivitiesPool as unknown as Activity[],
  week7Meta as WeekMeta,
  week7Concepts as Concept[],
  week7Synthesis,
  week7KnowledgeMap,
  week7StudyPath,
  week7Achievements as unknown as Achievement[],
  week7DeepFlashcardCourseIds,
  week7DeepActivityCourseIds,
  buildWeek7DeepFlashcardPool,
  buildWeek7DeepActivityPool,
);

const week8Bundle: WeekBundle = buildWeekBundle(
  week8Courses as Course[],
  week8FlashcardsPool as unknown as Flashcard[],
  week8Quizzes as AnyQuestion[],
  week8ActivitiesPool as unknown as Activity[],
  week8Meta as WeekMeta,
  week8Concepts as Concept[],
  week8Synthesis,
  week8KnowledgeMap,
  week8StudyPath,
  week8Achievements as unknown as Achievement[],
  week8DeepFlashcardCourseIds,
  week8DeepActivityCourseIds,
  buildWeek8DeepFlashcardPool,
  buildWeek8DeepActivityPool,
);

export const data = {
  weeks: {
    week1: week1Bundle,
    week2: week2Bundle,
    week3: week3Bundle,
    week4: week4Bundle,
    week5: week5Bundle,
    week6: week6Bundle,
    week7: week7Bundle,
    week8: week8Bundle,
  } as Record<string, WeekBundle>,
  achievements: (() => {
    const seen = new Set<string>();
    const out: Achievement[] = [];
    for (const a of [
      ...week1Bundle.achievements,
      ...week2Bundle.achievements,
      ...week3Bundle.achievements,
      ...week4Bundle.achievements,
      ...week5Bundle.achievements,
      ...week6Bundle.achievements,
      ...week7Bundle.achievements,
      ...week8Bundle.achievements,
    ]) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        out.push(a);
      }
    }
    return out;
  })(),
};

export const week1 = week1Bundle;
export const week2 = week2Bundle;
export const week3 = week3Bundle;
export const week4 = week4Bundle;
export const week5 = week5Bundle;
export const week6 = week6Bundle;
export const week7 = week7Bundle;
export const week8 = week8Bundle;

export const getCourseById = (weekBundle: WeekBundle, id: string) => {
  const direct = weekBundle.courses.find((c) => c.id === id);
  if (direct) return direct;
  for (const w of Object.values(data.weeks)) {
    const found = w.courses.find((c) => c.id === id);
    if (found) return found;
  }
  return undefined;
}

export const getCourseBySlug = (weekBundle: WeekBundle, slug: string) => {
  const direct = weekBundle.courses.find((c) => c.slug === slug);
  if (direct) return direct;
  for (const w of Object.values(data.weeks)) {
    const found = w.courses.find((c) => c.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export const getFlashcardsForCourse = (weekBundle: WeekBundle, courseId: string) => {
  const direct = weekBundle.flashcards.filter((f) => f.courseId === courseId);
  if (direct.length > 0) return direct;
  for (const w of Object.values(data.weeks)) {
    const found = w.flashcards.filter((f) => f.courseId === courseId);
    if (found.length > 0) return found;
  }
  return direct;
}

export const getQuestionsForCourse = (weekBundle: WeekBundle, courseId: string) => {
  const direct = weekBundle.quizzes.filter((q) => q.courseId === courseId);
  if (direct.length > 0) return direct;
  for (const w of Object.values(data.weeks)) {
    const found = w.quizzes.filter((q) => q.courseId === courseId);
    if (found.length > 0) return found;
  }
  return direct;
}

export const getActivitiesForCourse = (weekBundle: WeekBundle, courseId: string) => {
  const direct = weekBundle.activities.filter((a) => a.courseId === courseId);
  if (direct.length > 0) return direct;
  for (const w of Object.values(data.weeks)) {
    const found = w.activities.filter((a) => a.courseId === courseId);
    if (found.length > 0) return found;
  }
  return direct;
}

export const getConceptById = (weekBundle: WeekBundle, id: string) =>
  weekBundle.concepts.find((c) => c.id === id);

export const buildKnowledgeBase = (): string => {
  const sections: string[] = [];
  for (const [weekId, bundle] of Object.entries(data.weeks)) {
    sections.push(`# ${bundle.meta.title} (${weekId})\n`);
    sections.push(`الفكرة الجامعة: ${bundle.synthesis.bigIdea}\n`);
    sections.push(`\n# التركيب الموحد:\n${bundle.synthesis.integratedExplanation}\n`);
    sections.push(
      `\n# الرسائل الأساسية:\n${bundle.synthesis.keyMessages.map((m: string) => `- ${m}`).join("\n")}\n`,
    );
    sections.push(`\n# دورات ${bundle.meta.title}:\n`);
    for (const c of bundle.courses) {
      sections.push(`\n## دورة: ${c.title} (${c.subtitle})`);
      sections.push(`المتحدث: ${c.speaker ?? "غير محدد"}`);
      sections.push(`المدة: ${c.duration}`);
      sections.push(`الملخص: ${c.summary}`);
      sections.push(`\nقاعدة المعرفة التفصيلية:\n${c.knowledgeBaseText}`);
      sections.push(
        `\nالمفاهيم الأساسية:\n${c.keyTerms.map((t) => `- ${t.term}: ${t.deepMeaning}`).join("\n")}`,
      );
    }
    sections.push(
      `\n# المفاهيم الجامعة:\n${bundle.concepts.map((c) => `- ${c.name}: ${c.deepExplanation}`).join("\n")}`,
    );
  }
  return sections.join("\n");
};

export { data as dataDefault };
