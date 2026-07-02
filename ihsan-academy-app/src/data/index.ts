// Data access layer — central place to import all Week 1 data
// Future weeks: add a similar index file under data/week2, data/week3, etc.

import courses from "./week1/courses";
import flashcards from "./week1/assessments/flashcards.json";
import quizzes from "./week1/assessments/quizzes.json";
import activities from "./week1/activities/activities.json";
import week1Meta from "./week1/week1.index.json";
import concepts from "./week1/concepts/concepts.json";
import week1Synthesis from "./week1/synthesis/week1-synthesis.json";
import knowledgeMap from "./week1/synthesis/cross-course-map.json";
import studyPath from "./week1/study-path.json";
import { achievements } from "./achievements";
import {
  buildDeepActivityPool,
  buildDeepFlashcardPool,
  deepActivityCourseIds,
  deepFlashcardCourseIds,
} from "./week1/deepContent";
import type {
  Course,
  Flashcard,
  AnyQuestion,
  Activity,
  Achievement,
  WeekMeta,
  Concept,
} from "@/types";

// When a course ships its own richer {courseId}.flashcards.json / .activities.json,
// those replace the thinner pooled entries for that course (instead of duplicating
// near-identical content). Courses without a dedicated file keep their pooled entries.
const mergedFlashcards: Flashcard[] = [
  ...(flashcards as Flashcard[]).filter((f) => !deepFlashcardCourseIds.has(f.courseId)),
  ...buildDeepFlashcardPool(),
];
const mergedActivities: Activity[] = [
  ...(activities as Activity[]).filter((a) => !deepActivityCourseIds.has(a.courseId)),
  ...buildDeepActivityPool(),
];

export const data = {
  week1: {
    meta: week1Meta as WeekMeta,
    courses: courses as Course[],
    flashcards: mergedFlashcards,
    quizzes: quizzes as AnyQuestion[],
    activities: mergedActivities,
    concepts: concepts as Concept[],
    synthesis: week1Synthesis,
    knowledgeMap,
    studyPath,
  },
  achievements: achievements as Achievement[],
};

// Re-export the static list for convenience
export { achievements };

export const getCourseById = (id: string) =>
  data.week1.courses.find((c) => c.id === id);

export const getCourseBySlug = (slug: string) =>
  data.week1.courses.find((c) => c.slug === slug);

export const getFlashcardsForCourse = (courseId: string) =>
  data.week1.flashcards.filter((f) => f.courseId === courseId);

export const getQuestionsForCourse = (courseId: string) =>
  data.week1.quizzes.filter((q) => q.courseId === courseId);

export const getActivitiesForCourse = (courseId: string) =>
  data.week1.activities.filter((a) => a.courseId === courseId);

export const getConceptById = (id: string) =>
  data.week1.concepts.find((c) => c.id === id);

export const getAllConcepts = () => data.week1.concepts;

// Build a flat text knowledge base for the AI tutor
export const buildKnowledgeBase = (): string => {
  const sections: string[] = [];
  sections.push(`# الأسبوع الأول من أكاديمية الإحسان — قاعدة المعرفة\n`);
  sections.push(`الفكرة الجامعة: ${data.week1.synthesis.bigIdea}\n`);

  sections.push(`\n# التركيب الموحد:\n${data.week1.synthesis.integratedExplanation}\n`);

  sections.push(`\n# الرسائل الأساسية:\n${data.week1.synthesis.keyMessages.map((m) => `- ${m}`).join("\n")}\n`);

  sections.push(`\n# الدورات:\n`);
  for (const c of data.week1.courses) {
    sections.push(`\n## دورة: ${c.title} (${c.subtitle})`);
    sections.push(`المتحدث: ${c.speaker ?? "غير محدد"}`);
    sections.push(`المدة: ${c.duration}`);
    sections.push(`الملخص: ${c.summary}`);
    sections.push(`\nقاعدة المعرفة التفصيلية:\n${c.knowledgeBaseText}`);
    sections.push(`\nالمفاهيم الأساسية:\n${c.keyTerms.map((t) => `- ${t.term}: ${t.deepMeaning}`).join("\n")}`);
  }

  sections.push(`\n# المفاهيم الجامعة:\n${data.week1.concepts.map((c) => `- ${c.name}: ${c.deepExplanation}`).join("\n")}`);

  return sections.join("\n");
};
