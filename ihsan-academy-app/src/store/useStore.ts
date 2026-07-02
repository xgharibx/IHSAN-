// Zustand global store for the Ihsan Academy
// Tracks progress, achievements, completed sections, quiz scores, etc.
// Designed to scale across weeks.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { achievements as allAchievements } from "@/data/achievements";
import type { Achievement } from "@/types";

export type CourseProgress = {
  courseId: string;
  started: boolean;
  completedSections: string[];
  flashcardsReviewed: string[];
  correctAnswers: number;
  totalAnswers: number;
  activitiesCompleted: string[];
  lastVisited: number;
};

interface State {
  // Progress
  courseProgress: Record<string, CourseProgress>;
  // Achievements unlocked
  unlockedAchievements: string[];
  // Recently visited
  recentCourseId?: string;
  // Selected week (for future multi-week support)
  selectedWeek: number;
  // AI chat history per session
  aiSessions: Record<string, { role: "user" | "model"; text: string; ts: number }[]>;
  // AI settings
  aiModel: string;
  // Personal notes
  notes: Record<string, string>;
  // Setter callbacks
  markStarted: (courseId: string) => void;
  markSectionRead: (courseId: string, sectionId: string) => void;
  markFlashcard: (courseId: string, flashcardId: string) => void;
  recordQuizAnswer: (courseId: string, correct: boolean) => void;
  markActivity: (courseId: string, activityId: string) => void;
  unlock: (achievementId: string) => void;
  setRecent: (courseId: string) => void;
  appendAi: (
    sessionId: string,
    msg: { role: "user" | "model"; text: string },
  ) => void;
  resetAi: (sessionId: string) => void;
  setNote: (courseId: string, text: string) => void;
  setSelectedWeek: (week: number) => void;
  resetAll: () => void;
}

const buildInitial = (): Record<string, CourseProgress> => ({});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      courseProgress: buildInitial(),
      unlockedAchievements: ["first-course-started"],
      selectedWeek: 1,
      aiSessions: {},
      aiModel: "gemini-2.5-flash",
      notes: {},
      markStarted: (courseId) => {
        const current = get().courseProgress[courseId];
        if (current?.started) return;
        set((s) => ({
          courseProgress: {
            ...s.courseProgress,
            [courseId]: {
              courseId,
              started: true,
              completedSections: [],
              flashcardsReviewed: [],
              correctAnswers: 0,
              totalAnswers: 0,
              activitiesCompleted: [],
              lastVisited: Date.now(),
            },
          },
        }));
        get().unlock("first-course-started");
      },
      markSectionRead: (courseId, sectionId) => {
        const cp = get().courseProgress[courseId];
        if (!cp) {
          get().markStarted(courseId);
        }
        set((s) => {
          const cur = s.courseProgress[courseId] ?? {
            courseId,
            started: true,
            completedSections: [],
            flashcardsReviewed: [],
            correctAnswers: 0,
            totalAnswers: 0,
            activitiesCompleted: [],
            lastVisited: Date.now(),
          };
          if (cur.completedSections.includes(sectionId)) return s;
          const updated: CourseProgress = {
            ...cur,
            completedSections: [...cur.completedSections, sectionId],
            lastVisited: Date.now(),
          };
          return { courseProgress: { ...s.courseProgress, [courseId]: updated } };
        });
        const after = get().courseProgress[courseId];
        if (after && after.completedSections.length >= 4) {
          get().unlock("first-course-completed");
        }
      },
      markFlashcard: (courseId, flashcardId) => {
        set((s) => {
          const cur = s.courseProgress[courseId];
          if (!cur) return s;
          if (cur.flashcardsReviewed.includes(flashcardId)) return s;
          return {
            courseProgress: {
              ...s.courseProgress,
              [courseId]: {
                ...cur,
                flashcardsReviewed: [...cur.flashcardsReviewed, flashcardId],
              },
            },
          };
        });
        const total = Object.values(get().courseProgress).reduce(
          (acc, c) => acc + c.flashcardsReviewed.length,
          0,
        );
        if (total >= 10) get().unlock("flashcard-explorer");
        if (total >= 50) get().unlock("flashcard-master");
      },
      recordQuizAnswer: (courseId, correct) => {
        set((s) => {
          const cur = s.courseProgress[courseId] ?? {
            courseId,
            started: true,
            completedSections: [],
            flashcardsReviewed: [],
            correctAnswers: 0,
            totalAnswers: 0,
            activitiesCompleted: [],
            lastVisited: Date.now(),
          };
          return {
            courseProgress: {
              ...s.courseProgress,
              [courseId]: {
                ...cur,
                correctAnswers: cur.correctAnswers + (correct ? 1 : 0),
                totalAnswers: cur.totalAnswers + 1,
              },
            },
          };
        });
        const cp = get().courseProgress[courseId];
        if (cp && cp.correctAnswers >= 5) get().unlock("quiz-passed");
        if (cp && cp.correctAnswers >= 20) get().unlock("quiz-master");
      },
      markActivity: (courseId, activityId) => {
        set((s) => {
          const cur = s.courseProgress[courseId];
          if (!cur) return s;
          if (cur.activitiesCompleted.includes(activityId)) return s;
          return {
            courseProgress: {
              ...s.courseProgress,
              [courseId]: {
                ...cur,
                activitiesCompleted: [...cur.activitiesCompleted, activityId],
              },
            },
          };
        });
        get().unlock("reflection-completed");
      },
      unlock: (achievementId) => {
        if (get().unlockedAchievements.includes(achievementId)) return;
        set((s) => ({
          unlockedAchievements: [...s.unlockedAchievements, achievementId],
        }));
      },
      setRecent: (courseId) => set({ recentCourseId: courseId }),
      appendAi: (sessionId, msg) => {
        set((s) => {
          const list = s.aiSessions[sessionId] ?? [];
          return {
            aiSessions: {
              ...s.aiSessions,
              [sessionId]: [...list, { ...msg, ts: Date.now() }],
            },
          };
        });
      },
      resetAi: (sessionId) => {
        set((s) => {
          const copy = { ...s.aiSessions };
          delete copy[sessionId];
          return { aiSessions: copy };
        });
      },
      setNote: (courseId, text) => {
        set((s) => ({ notes: { ...s.notes, [courseId]: text } }));
      },
      setSelectedWeek: (week) => set({ selectedWeek: week }),
      resetAll: () => {
        set({
          courseProgress: {},
          unlockedAchievements: ["first-course-started"],
          recentCourseId: undefined,
          aiSessions: {},
          notes: {},
        });
      },
    }),
    {
      name: "ihsan-academy-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        courseProgress: s.courseProgress,
        unlockedAchievements: s.unlockedAchievements,
        recentCourseId: s.recentCourseId,
        selectedWeek: s.selectedWeek,
        aiSessions: s.aiSessions,
        aiModel: s.aiModel,
        notes: s.notes,
      }),
    },
  ),
);

// Convenience helpers
export const isCourseCompleted = (
  cp: CourseProgress | undefined,
  totalSections: number,
) => !!cp && cp.completedSections.length >= totalSections;

export const computeCourseProgressPercent = (
  cp: CourseProgress | undefined,
  totalSections: number,
  totalFlashcards: number,
  totalActivities: number,
) => {
  if (!cp) return 0;
  const sectionP = totalSections ? (cp.completedSections.length / totalSections) * 0.5 : 0;
  const fcP = totalFlashcards ? (cp.flashcardsReviewed.length / totalFlashcards) * 0.3 : 0;
  const actP = totalActivities
    ? (cp.activitiesCompleted.length / totalActivities) * 0.2
    : 0;
  return Math.min(100, Math.round((sectionP + fcP + actP) * 100));
};

export type { Achievement };
