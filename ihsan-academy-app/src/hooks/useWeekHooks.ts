import { useWeekData } from "./useWeekData";
import type { Course, Flashcard, AnyQuestion, Activity, Concept, WeekMeta } from "@/types";

export function useCourses(): Course[] {
  return useWeekData().courses;
}

export function useFlashcards(): Flashcard[] {
  return useWeekData().flashcards;
}

export function useQuizzes(): AnyQuestion[] {
  return useWeekData().quizzes;
}

export function useActivities(): Activity[] {
  return useWeekData().activities;
}

export function useConcepts(): Concept[] {
  return useWeekData().concepts;
}

export function useWeekMeta(): WeekMeta {
  return useWeekData().meta;
}

export function useSynthesis() {
  return useWeekData().synthesis;
}

export function useKnowledgeMap() {
  return useWeekData().knowledgeMap;
}

export function useStudyPath() {
  return useWeekData().studyPath;
}
