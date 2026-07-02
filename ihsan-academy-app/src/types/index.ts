// Shared TypeScript types for the Ihsan Academy platform
// These types power Week 1 and are designed to scale for Week 2, 3, 4...

export type Difficulty = "easy" | "medium" | "hard";
export type ConceptDomain =
  | "tauhid"
  | "ibadah"
  | "akhlaq"
  | "fiqh"
  | "tafsir"
  | "seerah"
  | "history"
  | "psychology"
  | "leadership"
  | "spiritual";

export interface MediaFile {
  type: "pdf" | "pptx" | "txt" | "image" | "audio";
  name: string;
  purpose: string;
}

export interface KeyTerm {
  term: string;
  transliteration?: string;
  definition: string;
  deepMeaning: string;
  example: string;
  memoryHook: string;
  relatedConcepts: string[];
}

export interface LessonSection {
  id: string;
  title: string;
  body: string;
  quote?: string;
  source?: string;
}

export interface CourseQuizRef {
  type: "mcq" | "tf" | "fitb" | "match" | "short" | "scenario" | "reflect";
  itemIds: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  domain: ConceptDomain;
  iconKey: string;
  folderName: string;
  speaker?: string;
  duration: string;
  files: MediaFile[];
  tagline: string;
  heroQuote: { text: string; source: string };
  learningObjectives: string[];
  outcomes: string[];
  summary: string;
  longSummary?: CourseLongSummary; // Master long summary (study-quality)
  deepExplanation?: CourseDeepDive; // Deep conceptual explanation, phase-by-phase
  sections: LessonSection[];
  studyGuide?: StudyGuide;
  deepConcepts?: ConceptDeep[]; // Optional richer, course-scoped concept breakdowns
  keyTerms: KeyTerm[];
  mustUnderstand: string[];
  commonMistakes: string[];
  realLifeExamples: string[];
  reflectionQuestions: string[];
  quickRevision: string[];
  relatedCourses: string[];
  relatedConcepts: string[];
  quizRefs: CourseQuizRef[];
  flashcardIds: string[];
  activityIds: string[];
  knowledgeBaseText: string; // Used by the AI Tutor as the source of truth
  sourceNotes?: string;
  qualityReviewNotes?: string;
  scrollColor: string;
  accentGradient: string;
}

// Deep-learning-specific structures

export interface StudyGuidePhaseContent {
  transcriptRange: string;
  mainThemes: string[];
  guidance: string[];
}

export interface StudyGuide {
  courseId?: string;
  title?: string;
  intro?: string;
  beforeStudying: { focus: string[]; questions: string[]; mindset: string };
  // Keyed by phase (e.g. "phase1Opening", "phase2Foundations", ...), in lecture order.
  duringStudying: Record<string, StudyGuidePhaseContent>;
  afterStudying: {
    revisionChecklist: string[];
    selfTest: string[];
    reflectionTask: string;
    practicalAction: string;
  };
  quickReview: { core: string[]; mustRemember: string[]; reflective: string[] };
}

// A single walked-through explanation of one concept/moment from the lecture.
export interface DeepDiveExplanation {
  id: string;
  conceptId?: string; // links to a ConceptDeep id, when the explanation is concept-scoped
  concept?: string; // short label, used when explanations are phase/transcript-scoped instead
  transcriptRef?: string;
  title: string;
  explanation: string;
  whyItMatters: string;
  misunderstanding: string;
  howToApply: string;
  thinkAboutThis: string;
}

// A chronological phase of a deep-dive walkthrough (e.g. phase 1 of 5).
export interface DeepDivePhase {
  phase: number;
  phaseLabel: string;
  transcriptLines: string;
  title: string;
  explanations: DeepDiveExplanation[];
}

export interface CourseDeepDive {
  id: string;
  courseId: string;
  title: string;
  introduction: string;
  explanations: DeepDiveExplanation[];
  phases: DeepDivePhase[];
}

export interface LongSummarySection {
  id: string;
  title: string;
  summary: string;
}

export interface CourseLongSummary {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  introduction: string;
  sections: LongSummarySection[];
  sourceGroundedNote?: string;
}

export interface ConceptDeep {
  id: string;
  name: string;
  arabicName?: string;
  domain: ConceptDomain;
  simpleDefinition: string;
  deepExplanation: string;
  whyItMatters: string;
  whereInLecture: string;
  example: string;
  relatedConceptIds: string[];
  commonMisunderstanding: string;
  revisionNote: string;
}

export interface FlashcardDeep {
  id: string;
  courseId: string;
  term: string;
  front: string;
  back: string;
  simpleAnswer: string;
  deepAnswer: string;
  example: string;
  relatedConcept: string;
  difficulty: Difficulty;
  memoryHook: string;
}

export interface AssessmentItemDeep {
  id: string;
  courseId: string;
  type: "mcq" | "tf" | "fitb" | "short" | "scenario" | "reflect" | "explain";
  prompt: string;
  difficulty: Difficulty;
  options?: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  relatedConcept: string;
  sourceSection: string;
  estimatedSeconds: number;
}

export interface ActivityDeep {
  id: string;
  courseId: string;
  type: "individual" | "group" | "practical" | "reflection" | "timeline" | "concept-mapping" | "action-plan";
  title: string;
  purpose: string;
  instructions: string;
  estimatedTime: string;
  outputExpected: string;
  relatedConcepts: string[];
  completionCriteria: string;
}

export interface AiTutorContext {
  courseId: string;
  courseName: string;
  whatItCovers: string;
  whatLearnerShouldUnderstand: string[];
  keyConcepts: string[];
  commonWeakPoints: string[];
  simpleExplanationApproach: string;
  deepExplanationApproach: string;
  hallucinationGuards: string[];
  modes: { id: string; label: string; description: string; samplePrompt: string }[];
}

export interface Concept {
  id: string;
  name: string;
  arabicName?: string;
  domain: ConceptDomain;
  definition: string;
  deepExplanation: string;
  example: string;
  relatedCourseIds: string[];
  relatedConceptIds: string[];
}

export type QuestionType =
  | "mcq"
  | "tf"
  | "fitb"
  | "match"
  | "short"
  | "scenario"
  | "reflect"
  | "explain";

export interface QuestionBase {
  id: string;
  type: QuestionType;
  courseId: string;
  conceptIds: string[];
  difficulty: Difficulty;
  estimatedSeconds: number;
  learningObjective: string;
  prompt: string;
  correctAnswer: string;
  explanation: string;
  whyWrong?: Record<string, string>;
}

export interface MCQ extends QuestionBase {
  type: "mcq";
  options: { id: string; text: string }[];
}

export interface TrueFalse extends QuestionBase {
  type: "tf";
}

export interface FillBlank extends QuestionBase {
  type: "fitb";
  // prompt contains "____" placeholders
}

export interface MatchQuestion extends QuestionBase {
  type: "match";
  pairs: { left: string; right: string }[];
}

export interface ShortAnswer extends QuestionBase {
  type: "short" | "scenario" | "reflect" | "explain";
  rubric?: string[];
}

export type AnyQuestion = MCQ | TrueFalse | FillBlank | MatchQuestion | ShortAnswer;

export interface Flashcard {
  id: string;
  courseId: string;
  conceptId?: string;
  term: string;
  simple: string;
  deep: string;
  example: string;
  relatedCourses: string[];
  relatedConcepts: string[];
  memoryHook: string;
}

export interface Activity {
  id: string;
  courseId: string;
  type: "individual" | "discussion" | "practical" | "reflection";
  title: string;
  prompt: string;
  duration: string;
  reward?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  criteria: string;
  unlockedByDefault?: boolean;
}

export interface TimelineDay {
  day: number;
  title: string;
  courses: string[];
  checkpoint: string;
}

export interface SynthesisNode {
  id: string;
  label: string;
  courseIds: string[];
  conceptIds: string[];
}

export interface SynthesisEdge {
  from: string;
  to: string;
  label: string;
}

export interface WeekMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  bigIdea: string;
  orderedCourseIds: string[];
  prerequisites?: string[];
  themes: { id: string; title: string; description: string; courseIds: string[] }[];
}

export interface StudyPath {
  id: string;
  weekId: string;
  steps: {
    order: number;
    courseId: string;
    objective: string;
    estimatedMinutes: number;
  }[];
}