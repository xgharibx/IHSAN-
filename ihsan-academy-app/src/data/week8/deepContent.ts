// Auto-discovery loader for optional, per-course "deep content" files.
//
// Convention (files live directly in this folder, next to courses.ts):
//   {courseId}.deep-explanation.json        -> base concept-by-concept deep dive
//   {courseId}.deep-explanation.pN.json      -> phase N of a chronological deep dive
//   {courseId}.long-summary.json             -> full detailed narrative summary
//   {courseId}.study-guide.json              -> before/during/after study guide
//   {courseId}.concepts.json                 -> richer, course-scoped concept breakdowns
//   {courseId}.flashcards.json               -> { courseId, cards: FlashcardDeep[] }
//   {courseId}.activities.json               -> { courseId, activities: ActivityDeep[] }
//
// None of these files are required. Any course automatically picks up whichever
// of these files exist for its id — no code changes needed to add more later.
import type {
  Activity,
  ActivityDeep,
  ConceptDeep,
  Course,
  CourseDeepDive,
  CourseLongSummary,
  DeepDivePhase,
  Flashcard,
  FlashcardDeep,
  StudyGuide,
} from "@/types";

type Eager<T> = Record<string, { default: T }>;

const deepExplanationBaseFiles = import.meta.glob("./*.deep-explanation.json", {
  eager: true,
}) as Eager<Omit<CourseDeepDive, "phases">>;

const deepExplanationPhaseFiles = import.meta.glob("./*.deep-explanation.p*.json", {
  eager: true,
}) as Eager<DeepDivePhase>;

const longSummaryFiles = import.meta.glob("./*.long-summary.json", {
  eager: true,
}) as Eager<CourseLongSummary>;

const studyGuideFiles = import.meta.glob("./*.study-guide.json", {
  eager: true,
}) as Eager<StudyGuide>;

const courseConceptFiles = import.meta.glob("./*.concepts.json", {
  eager: true,
}) as Eager<ConceptDeep[]>;

const courseFlashcardFiles = import.meta.glob("./*.flashcards.json", {
  eager: true,
}) as Eager<{ courseId: string; cards: FlashcardDeep[] }>;

const courseActivityFiles = import.meta.glob("./*.activities.json", {
  eager: true,
}) as Eager<{ courseId: string; activities: ActivityDeep[] }>;

// "./ihsan-soul.deep-explanation.p1.json" -> "ihsan-soul" (course ids never contain dots)
function courseIdFromPath(filePath: string): string {
  const fileName = filePath.split("/").pop() ?? filePath;
  const dotIndex = fileName.indexOf(".");
  return dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
}

function groupByCourseId<T>(glob: Eager<T>): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const [filePath, mod] of Object.entries(glob)) {
    const courseId = courseIdFromPath(filePath);
    const list = map.get(courseId);
    if (list) list.push(mod.default);
    else map.set(courseId, [mod.default]);
  }
  return map;
}

const baseByCourseId = groupByCourseId(deepExplanationBaseFiles);
const phasesByCourseId = groupByCourseId(deepExplanationPhaseFiles);
const longSummaryByCourseId = groupByCourseId(longSummaryFiles);
const studyGuideByCourseId = groupByCourseId(studyGuideFiles);
const conceptsByCourseId = groupByCourseId(courseConceptFiles);
const flashcardsByCourseId = groupByCourseId(courseFlashcardFiles);
const activitiesByCourseId = groupByCourseId(courseActivityFiles);

/** Returns a new courses array with any discovered deep content merged in. */
export function attachDeepContent(courses: Course[]): Course[] {
  return courses.map((course) => {
    const base = baseByCourseId.get(course.id)?.[0];
    const phases = (phasesByCourseId.get(course.id) ?? [])
      .slice()
      .sort((a, b) => a.phase - b.phase);

    let deepExplanation: CourseDeepDive | undefined = course.deepExplanation;
    if (base) {
      deepExplanation = { ...base, phases };
    } else if (phases.length) {
      deepExplanation = {
        id: `${course.id}-deep-explanation`,
        courseId: course.id,
        title: course.title,
        introduction: "",
        explanations: [],
        phases,
      };
    }

    const longSummary = longSummaryByCourseId.get(course.id)?.[0] ?? course.longSummary;
    const studyGuide = studyGuideByCourseId.get(course.id)?.[0] ?? course.studyGuide;
    const deepConcepts = conceptsByCourseId.get(course.id)?.flat() ?? course.deepConcepts;

    return {
      ...course,
      deepExplanation,
      longSummary,
      studyGuide,
      deepConcepts,
    };
  });
}

const ACTIVITY_TYPE_MAP: Record<ActivityDeep["type"], Activity["type"]> = {
  individual: "individual",
  group: "discussion",
  practical: "practical",
  reflection: "reflection",
  timeline: "individual",
  "concept-mapping": "individual",
  "action-plan": "practical",
};

/** Course ids that ship a richer, dedicated flashcards file. */
export const deepFlashcardCourseIds = new Set(flashcardsByCourseId.keys());
/** Course ids that ship a richer, dedicated activities file. */
export const deepActivityCourseIds = new Set(activitiesByCourseId.keys());

/** Normalizes every discovered {courseId}.flashcards.json into the standard Flashcard shape. */
export function buildDeepFlashcardPool(): Flashcard[] {
  const out: Flashcard[] = [];
  for (const [courseId, files] of flashcardsByCourseId) {
    for (const file of files) {
      for (const card of file.cards) {
        out.push({
          id: card.id,
          courseId,
          conceptId: card.relatedConcept,
          term: card.term,
          simple: card.simpleAnswer,
          deep: card.deepAnswer,
          example: card.example,
          relatedCourses: [courseId],
          relatedConcepts: card.relatedConcept ? [card.relatedConcept] : [],
          memoryHook: card.memoryHook,
        });
      }
    }
  }
  return out;
}

/** Normalizes every discovered {courseId}.activities.json into the standard Activity shape. */
export function buildDeepActivityPool(): Activity[] {
  const out: Activity[] = [];
  for (const [courseId, files] of activitiesByCourseId) {
    for (const file of files) {
      for (const act of file.activities) {
        out.push({
          id: act.id,
          courseId,
          type: ACTIVITY_TYPE_MAP[act.type] ?? "individual",
          title: act.title,
          prompt: act.instructions,
          duration: act.estimatedTime,
        });
      }
    }
  }
  return out;
}
