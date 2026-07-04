// Chat memory service — tracks what the user has asked about, weak areas, and learning patterns.
// Persisted to localStorage for cross-session learning.

const STORAGE_KEY = "ihsan-chat-memory-v2";

export interface TopicRecord {
  weekId: number;
  courseId: string;
  topic: string;
  timestamp: number;
  count: number;
}

interface MemoryState {
  topicsByWeek: Record<number, TopicRecord[]>;
  // Per-course mastery (0..1, soft estimate from question frequency + length)
  masteryByCourse: Record<string, number>;
  // Last session date per course
  lastVisit: Record<string, number>;
  // Per-week visit count
  visitCount: Record<number, number>;
  // Per-mode preference
  preferredMode: string | null;
}

const initialState: MemoryState = {
  topicsByWeek: {},
  masteryByCourse: {},
  lastVisit: {},
  visitCount: {},
  preferredMode: null,
};

class ChatMemory {
  private state: MemoryState = initialState;
  private loaded = false;

  private load() {
    if (this.loaded) return;
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...initialState, ...parsed };
      }
    } catch {}
    this.loaded = true;
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  recordTopic(weekId: number, courseId: string, topic: string) {
    this.load();
    if (!this.state.topicsByWeek[weekId]) this.state.topicsByWeek[weekId] = [];
    const existing = this.state.topicsByWeek[weekId].find(t => t.courseId === courseId && t.topic === topic);
    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      this.state.topicsByWeek[weekId].push({ weekId, courseId, topic, timestamp: Date.now(), count: 1 });
    }
    if (this.state.topicsByWeek[weekId].length > 50) {
      this.state.topicsByWeek[weekId] = this.state.topicsByWeek[weekId].slice(-50);
    }
    this.save();
  }

  recordCourseVisit(courseId: string) {
    this.load();
    this.state.lastVisit[courseId] = Date.now();
    this.state.masteryByCourse[courseId] = Math.min(1, (this.state.masteryByCourse[courseId] ?? 0) + 0.05);
    const weekId = Object.entries(this.state.lastVisit).find(([k]) => k === courseId)?.[0];
    if (weekId) this.save();
  }

  recordWeekVisit(weekId: number) {
    this.load();
    this.state.visitCount[weekId] = (this.state.visitCount[weekId] ?? 0) + 1;
    this.save();
  }

  recordModePreference(mode: string) {
    this.load();
    this.state.preferredMode = mode;
    this.save();
  }

  /** Returns a 1-2 sentence summary used in the system prompt */
  getMemorySummary(): string {
    this.load();
    const totalTopics = Object.values(this.state.topicsByWeek).flat().length;
    if (totalTopics === 0) {
      return "هذه أول محادثة في الأسبوع الحالي. ذاكرة المتعلّم فارغة. لا تَفترض أنه يعرف المفاهيم الأساسية.";
    }
    const recentTopics = Object.values(this.state.topicsByWeek)
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(t => t.topic)
      .join("، ");
    const visitedWeeks = Object.keys(this.state.visitCount).join("، ");
    return `المتعلّم تَكلّم في هذه المواضيع مؤخرًا: ${recentTopics}. الأسابيع التي زارها: ${visitedWeeks}. لا تَكرر ما يعرفه، وعَزِّز ما يحتاجه.`;
  }

  getRecentTopicsForWeek(weekId: number, n = 5): TopicRecord[] {
    this.load();
    return (this.state.topicsByWeek[weekId] ?? []).slice(-n);
  }

  getMastery(courseId: string): number {
    this.load();
    return this.state.masteryByCourse[courseId] ?? 0;
  }

  reset() {
    this.state = { ...initialState };
    this.save();
  }
}

export const chatMemory = new ChatMemory();