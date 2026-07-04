// Smart suggestions service — context-aware follow-up questions, course context building.

import type { Course, Concept, KeyTerm } from "@/types";

/**
 * Build a course-specific context block to inject into the system prompt.
 * This makes the selected course the primary context (instead of just dumping the whole knowledge base).
 */
export function buildCourseContext(course: Course | undefined): string {
  if (!course) {
    return "لم يختر المتعلّم دورة بعد. اسأله أن يختار دورة من القائمة الجانبية.";
  }

  // Build a structured context with sections, key terms, common mistakes
  const sections = course.sections?.slice(0, 5).map((s, i) =>
    `${i + 1}) [${s.title || "قسم"}]: ${s.body?.substring(0, 200) ?? ""}${s.body && s.body.length > 200 ? "..." : ""}`
  ).join("\n") ?? "";

  const keyTerms = course.keyTerms?.slice(0, 6).map((t) =>
    `   - **${t.term}**: ${t.definition?.substring(0, 150) ?? ""}`
  ).join("\n") ?? "";

  const mustUnderstand = course.mustUnderstand?.slice(0, 6).map((m, i) => `${i + 1}) ${m}`).join("\n") ?? "";

  const commonMistakes = course.commonMistakes?.slice(0, 4).map((m) => `   - ${m}`).join("\n") ?? "";

  return `# الدورة المُختارة حاليًا: ${course.title}
- المُتحدِّث: ${course.speaker ?? "غير محدد"}
- المدة: ${course.duration}
- الوصف: ${course.subtitle}

## الملخّص:
${course.summary}

## أبرز 5 أقسام في الدورة:
${sections}

## أهم 6 مفاهيم أساسية:
${mustUnderstand}

## أهم 6 مصطلحات:
${keyTerms}

## الأخطاء الشائعة:
${commonMistakes}

## قاعدة المعرفة التفصيلية (knowledgeBaseText):
${course.knowledgeBaseText}`;
}

/**
 * Pick the most relevant concepts for a given user query, by simple keyword overlap.
 * Returns top N concepts sorted by relevance.
 */
export function pickRelevantConcepts(
  query: string,
  course: Course | undefined,
  n = 3,
): Concept[] {
  if (!course) return [];
  // Course-level concepts are loaded from `concepts/concepts.json` and per-course loose files.
  // For now we just return the key terms as a fallback list.
  const candidates: Concept[] = (course.keyTerms ?? []).map((t, i) => ({
    id: `${course.id}-keyterm-${i}`,
    name: t.term,
    arabicName: t.term,
    domain: course.domain,
    definition: t.definition,
    deepExplanation: t.deepMeaning,
    whyItMatters: "",
    whereInLecture: "",
    example: t.example ?? "",
    relatedConceptIds: [],
    relatedCourseIds: [course.id],
    commonMisunderstanding: "",
    revisionNote: t.memoryHook ?? "",
  }));
  if (!query) return candidates.slice(0, n);
  const qWords = new Set(query.split(/\s+/).filter(w => w.length > 2));
  const scored = candidates.map(c => {
    const text = ((c.name ?? "") + " " + (c.definition ?? "") + " " + (c.deepExplanation ?? "")).toLowerCase();
    let score = 0;
    qWords.forEach(w => {
      const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const matches = text.match(re);
      if (matches) score += matches.length;
    });
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map(s => s.c);
}

/**
 * Generate 3 smart follow-up question suggestions based on the AI's last answer.
 */
export function generateSmartSuggestions(lastAnswer: string, mode: string, course: Course | undefined): string[] {
  if (!course) {
    return [
      "اشرح لي هذه النقطة بمثال عملي.",
      "ما المرجع في القرآن أو السنة؟",
      "كيف أطبق هذا في حياتي اليومية؟",
    ];
  }

  const baseQ: string[] = [
    `ما الأخطاء الشائعة في فهم ${course.title}؟`,
    `كيف يَربط ${course.title} بدورات أخرى في هذا الأسبوع؟`,
    `أعطني مثالًا تطبيقيًا من ${course.title} في حياتي اليوم.`,
  ];

  // Mode-specific suggestions
  switch (mode) {
    case "quiz":
      return [
        `اختبرني بسؤال متوسط الصعوبة من ${course.title}.`,
        `اختبرني بسؤال تطبيقي.`,
        `اختبرني بأسئلة ربط بين الدورات.`,
      ];
    case "plan":
      return [
        `كيف أوزع ${course.title} على أسبوعي؟`,
        `ما الوقت الأمثل لمذاكرة ${course.title}؟`,
        `كم دقيقة يوميًا أخصص لـ ${course.title}؟`,
      ];
    case "reflect":
      return [
        `ما التحدي الأكبر في تطبيق ${course.title}؟`,
        `كيف أحوّل ${course.title} لسلوك يومي؟`,
        `ما شعورك الآن بعد فهم ${course.title}؟`,
      ];
    case "deep":
      return [
        `أعطني تخريج الحديث.`,
        `ما الإجماع والخلاف في هذا الحكم؟`,
        `ما المرجع الفقهي الأصلي؟`,
      ];
    default:
      return baseQ;
  }
}