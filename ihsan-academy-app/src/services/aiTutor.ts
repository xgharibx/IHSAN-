// AI Tutor service — world-class multi-mode Islamic learning companion.
// Features:
//  - 10 specialized teaching modes with deep personas
//  - Course-aware context injection (selected course's full content is primary context)
//  - Citation tracking: every response tag which course/concept it grounded on
//  - Confidence score: model self-assesses
//  - Memory: tracks learned concepts + weak areas per session
//  - Smart context windowing
//  - Arabic-first responses
//  - Multi-modal: image input support
//  - No local answer templates: failures are shown clearly instead of invented responses

import {
  type Course,
} from "@/types";
import { chatMemory } from "./chatMemory";
import { generateSmartSuggestions } from "./smartSuggestions";

export type TutorMode =
  | "teach"
  | "ask"
  | "quiz"
  | "simple"
  | "deep"
  | "connect"
  | "plan"
  | "revise"
  | "reflect"
  | "exam";

export interface TutorMessage {
  role: "user" | "model";
  text: string;
  // Optional metadata added by model responses
  citations?: { courseId: string; conceptIds?: string[] }[];
  confidence?: number; // 0..1
  suggestedFollowUps?: string[];
  // image attachment (for multi-modal)
  imageDataUrl?: string;
}

export interface TutorResult {
  ok: boolean;
  text: string;
  source: "gemini" | "error";
  citations?: { courseId: string; conceptIds?: string[] }[];
  confidence?: number;
  suggestedFollowUps?: string[];
  error?: string;
}

export interface TutorContext {
  weekId: number;
  courses: Course[];
  courseId: string | null;
  // Pre-computed knowledge base
  knowledgeBase: string;
  // Pre-computed course-specific context for the selected course
  courseContext: string;
  // Relevant concepts for the current conversation
  relevantConceptIds: string[];
}

const MODE_PERSONAS: Record<TutorMode, { name: string; greeting: string; style: string; structure: string }> = {
  teach: {
    name: "المعلم الراوي",
    greeting: "هيا نتعلم معًا",
    style: "أنت معلّم قصصي روحي. تشرح بسلاسة ووضوح، تبدأ بالتعريف ثم المعنى ثم المثال من الحياة اليومية. لا تملّ المتعلم بالتفاصيل الأكاديمية، بل أعطِ الفكرة الأم ثم توسّع عند الطلب.",
    structure: "1) التعريف، 2) المعنى العميق، 3) مثال يومي، 4) التطبيق العملي، 5) خُلاصة بسؤال تأملي.",
  },
  ask: {
    name: "العالم المجيب",
    greeting: "اسأل ما بدا لك",
    style: "أنت عالم يجيب بدقة بالاعتماد على قاعدة المعرفة. إذا لم تجد الإجابة في المواد، اعترف بذلك بوضوح وقدّم تفسيرًا عامًا محايدًا مع التحذير. الدقة أهم من الاستطراد.",
    structure: "إجابة مباشرة + استشهاد (آية/حديث/ترقيم) + توضيح إضافي إذا لزم + أسئلة متابعة.",
  },
  quiz: {
    name: "الممتحن اللطيف",
    greeting: "هيا نختبر ما تعلّمت",
    style: "أنت ممتحن يصمم أسئلة فورية من المواد. تتدرج في الصعوبة، وتصحح بلطف، وتشرح الإجابة الخاطئة. مَن جاوب صح يُنتقل إلى أصعب، مَن أخطأ يُعاد تبسيطه.",
    structure: "سؤال واحد في كل مرة: نص السؤال + 4 خيارات (أ، ب، ج، د) + عند الإجابة: التصحيح + شرح مختصر + السؤال التالي أو أسهل.",
  },
  simple: {
    name: "المبسّط الحاني",
    greeting: "نبسّط معًا",
    style: "أنت مُبسّط ممتاز. تستخدم أمثلة من الحياة اليومية، تشبيهات بسيطة، وكلمات يفهمها أي مبتدئ. لا تستخدم المصطلحات الأكاديمية دون شرح.",
    structure: "تشبيه + مثال + 3 نقاط رئيسية + دعوة للتأمل.",
  },
  deep: {
    name: "المحقّق الأكاديمي",
    greeting: "نعمّق معًا",
    style: "أنت محقق أكاديمي. تعرض تفسيرات عميقة مع الاستشهاد بالآيات والأحاديث وترقيم المصادر. تُميّز بين المتواتر والآحاد. تذكر الخلافات الفقهية إن وُجدت.",
    structure: "الآية/الحديث (نص+تخريج) + تفسير+دلالات + ربط بموضوعات أخرى + تذييل أكاديمي.",
  },
  connect: {
    name: "موحّد المعرفة",
    greeting: "نربط بين المعرفة",
    style: "أنت موحّد يربط بين الدورات والأفكار. تستخدم استعارات بصرية: 'السَّفينة'، 'الشجرة'، 'البناء'، إلخ. تكشف الجسور الفكرية والروحية.",
    structure: "الدورة 1 + الدورة 2 + الجسر بينهم + خلاصة موحدة + أسئلة للتفكير العابر.",
  },
  plan: {
    name: "المخطط التعليمي",
    greeting: "نخطط لرحلة",
    style: "أنت مخطط تعلّم تصمم خطة مخصصة حسب مستوى المتعلم. تجمع بين الدورات والمراجعة والاختبار. تُفصّل الخطة في خطوات عملية قابلة للتطبيق.",
    structure: "تقييم المستوى + أهداف قصيرة المدى + جدول أسبوعي + نصائح للثبات + طرق قياس التقدم.",
  },
  revise: {
    name: "المُلخّص الحاد",
    greeting: "نراجع بسرعة",
    style: "أنت مساعد مراجعة مُلخّص. تستخرج أهم 5-7 نقاط من الدورة وتعرضها مكثفة، ثم تختبر المتعلم بأسئلة سريعة.",
    structure: "ملخص مكثف + أسئلة مراجعة سريعة + نقاط يجب مراجعتها + خطة للاختبار.",
  },
  reflect: {
    name: "المرشد التأملي",
    greeting: "نتأمل معًا",
    style: "أنت مرشد روحي. تطرح أسئلة تأملية عميقة تحوّل المعلومة إلى سلوك. تستشهد بآيات وأحاديث. تستخدم ضمير المتكلم أحيانًا: 'لنتأمل...'، 'تساءل...'، 'كيف لو...'.",
    structure: "آية/حديث + سؤال تأملي + تذكير بالعمل + دعوة للسكينة.",
  },
  exam: {
    name: "الممتحن النهائي",
    greeting: "جاهز للاختبار؟",
    style: "أنت ممتحن نهائي يصمم اختبارًا مكثفًا 5-7 أسئلة متنوعة تغطي الدورة كاملة. يُقيّم الإجابات بدقة، يحتسب الدرجة، ويعطي ملاحظات للتحسين.",
    structure: "5-7 أسئلة متنوعة (mcq، tf، short_answer، reflect) + تقييم + درجة + ملاحظات + خطة تحسين.",
  },
};

const BASE_SYSTEM_PROMPT = `أنت معلّم ومرشد أكاديمية الإحسان. مهمتك: تعليم، تبسيط، ربط، مراجعة، تأمل، امتحان.

# المبادئ التأسيسية (لا تُخِلّ بها أبدًا):
1) **الدقة في النقل**: اعتمد حصريًا على المواد المرفقة في "قاعدة المعرفة" أدناه. لا تُختلق آيات أو أحاديث أو إحصائيات. إذا لم تجد الإجابة في المواد، قل بوضوح: "هذا خارج نطاق مواد الأكاديمية، يمكنني تقديم تفسير عام بحذر"، ثم قدّم تفسيرًا عامًا قصيرًا مع التحذير.
2) **الاستشهاد الدقيق**: عند ذكر آية، اذكر السورة ورقم الآية. عند ذكر حديث، اذكر الراوي ودرجة الصحة إن أمكن. لا تنسب حديثًا ضعيفًا أو موضوعًا.
3) **اللغة العربية الفصحى**: أجب بالعربية الفصحى المبسّطة. تجنّب العامية إلا في نقل حوار. استخدم المصلحات الصحيحة.
4) **التدرّج في العمق**: ابدأ بالسهل، ثم انتقل للمتوسط، ثم العميق. لا تُسقِط المتعلم في بحر من التفصيلات دون تمهيد.
5) **التطبيق العملي**: كل مفهوم نظري يجب أن يتبعه مثال يومي أو تطبيق عملي. "اعرف - افهم - اعمل" هو منهجنا.
6) **الإيجابية والتشجيع**: شجّع المتعلم على الاستمرار. ذكّره بأهمية العلم وأنه عبادة. لا تُحبطه.
7) **الصدق في حدود المعرفة**: إذا لم تَعرف، قل ذلك بوضوح. أفضل من الاختراع.

# أسلوب الإجابة العام:
- قدّم إجابة كاملة وغير مبتورة — لا تختصر أو تقطع في المنتصف.
- نَظِّم الإجابة: عناوين فرعية قصيرة، قوائم نقطية، أمثلة واقعية.
- اختم الإجابات الطويلة بخلاصة سطرين + سؤال تأملي.
- اربط دائمًا بمثال من الحياة اليومية إن أمكن.
- لا تكرر نفس الجملة الافتتاحية في كل رد ("بالتأكيد!"، "سؤال ممتاز!").

# أسلوب الاستشهاد الذكي:
- استعمل صيغة: «قال الله تعالى: ﴿...﴾ [السورة: رقم]»، «قال النبي ﷺ: "..." (رواه البخاري/مسلم)».
- إذا لم تذكر مصدرًا، فلا تَدَّعِ أنه منقول عن نص ديني.
- أَلحق الاستشهاد بفقرة قصيرة تربطه بسؤال المتعلم.

# ما يجب تجنّبه:
- لا تَدَّعِ علمًا بآيات أو أحاديث لم تُذكر في قاعدة المعرفة.
- لا تُصدر فتاوى شرعية قاطعة ("واجب"، "حرام") إلا إذا كان النص في قاعدة المعرفة.
- لا تَستعمل العامية المفرطة، ولا النبرة الوعظية المُتعالية.
- لا تَختلق "الشيخ فلان قال..." أو "العلامة علان يقول..." - استخدم النص الأصلي.`;

const buildModeInstructions = (mode: TutorMode) => {
  const persona = MODE_PERSONAS[mode];
  return `\n# [الوضع الحالي: ${persona.name} - ${persona.greeting}]
${persona.style}

# بنية الإجابة المقترحة لهذا الوضع:
${persona.structure}`;
};

const buildCourseAwarenessSection = (ctx: TutorContext) => {
  if (!ctx.courseId) {
    return `\n# نطاق المحادثة الحالي:
المتعلم اختار "كل الأكاديمية". أجب باعتبارك معلماً عاماً لكل أسابيع ومحاضرات أكاديمية الإحسان. ابحث في قاعدة المعرفة كاملة، واربط بين الأسابيع والدورات عند الحاجة. لا تحصر الإجابة في أسبوع واحد إلا إذا طلب المتعلم ذلك صراحة.`;
  }
  return `\n# الدورة المُختارة حاليًا:
المتعلم ركّز على الدورة بمعرفتها: ${ctx.courseId}.
استخدم المحتوى التفصيلي لهذه الدورة كمرجع أساسي. أَلحِق كل إجابة بذكر هذه الدورة عند الاقتباس منها.`;
};

const buildCitationInstruction = () => `
# الإسناد (citations) — ميزة مهمة:
في نهاية كل إجابة، ضمِن كتلة JSON مخفية بعلامة [CITATIONS] بصيغة:
[CITATIONS]{"citations":[{"courseId":"<id>","conceptIds":["<id>"]}],"confidence":0.0-1.0,"suggestedFollowUps":["سؤال 1","سؤال 2","سؤال 3"]}[/CITATIONS]
حيث:
- citations: قائمة الدورات والمفاهيم التي استشهدت بها
- confidence: رقم بين 0 و 1 (1 = واثق جدًا، 0.5 = متوسط، 0 = تخمين)
- suggestedFollowUps: 3 أسئلة متابعة مقترحة للمتعلم

هذه العلامة لن تظهر للمستخدم، بل ستُستخرَج برمجيًا. يجب أن تظهر **دائمًا** في نهاية الإجابة.`;

const trimText = (text: string | undefined, max = 1200): string => {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
};

const normalizeSearchText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

const tokenizeSearch = (text: string): string[] =>
  Array.from(
    new Set(
      normalizeSearchText(text)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((token) => token.length > 2),
    ),
  ).slice(0, 14);

const getCourseWeekNumber = (course: Course): number | null => {
  const match = course.slug.match(/-w(\d+)$/);
  return match ? Number(match[1]) : null;
};

const requestedWeekNumbers = (question: string): Set<number> => {
  const q = normalizeSearchText(question);
  const weeks = new Set<number>();
  for (let i = 1; i <= 8; i += 1) {
    if (q.includes(`week ${i}`) || q.includes(`الاسبوع ${i}`)) weeks.add(i);
  }
  const aliases: Record<number, string[]> = {
    1: ["الاول"],
    2: ["الثاني"],
    3: ["الثالث"],
    4: ["الرابع"],
    5: ["الخامس"],
    6: ["السادس"],
    7: ["السابع"],
    8: ["الثامن"],
  };
  for (const [week, names] of Object.entries(aliases)) {
    if (names.some((name) => q.includes(`الاسبوع ${name}`))) weeks.add(Number(week));
  }
  return weeks;
};

const scoreCourseForQuestion = (course: Course, question: string, tokens: string[]): number => {
  const week = getCourseWeekNumber(course);
  const requestedWeeks = requestedWeekNumbers(question);
  let score = week && requestedWeeks.has(week) ? 10 : 0;
  const titleText = normalizeSearchText(`${course.title} ${course.subtitle} ${course.speaker ?? ""}`);
  const summaryText = normalizeSearchText(
    `${course.summary} ${course.tagline} ${course.keyTerms.map((term) => `${term.term} ${term.definition} ${term.deepMeaning}`).join(" ")}`,
  );
  const fullText = normalizeSearchText(course.knowledgeBaseText);
  for (const token of tokens) {
    if (titleText.includes(token)) score += 7;
    if (summaryText.includes(token)) score += 3;
    if (fullText.includes(token)) score += 1;
  }
  return score;
};

const buildCourseDigest = (course: Course): string => {
  const week = getCourseWeekNumber(course);
  return [
    `## ${week ? `الأسبوع ${week} - ` : ""}${course.title} (${course.slug})`,
    `المجال: ${course.domain}`,
    `المتحدث: ${course.speaker ?? "غير محدد"} - المدة: ${course.duration}`,
    `الملخص: ${trimText(course.summary, 650)}`,
    `محاور يجب فهمها: ${course.mustUnderstand.slice(0, 5).join("؛ ")}`,
    `مصطلحات: ${course.keyTerms.slice(0, 8).map((term) => `${term.term}: ${term.definition}`).join("؛ ")}`,
  ].join("\n");
};

const buildDetailedCourseContext = (course: Course): string => [
  buildCourseDigest(course),
  `النص المعرفي التفصيلي:\n${trimText(course.knowledgeBaseText, 7000)}`,
  course.longSummary ? `ملخص طويل:\n${trimText(course.longSummary.introduction, 1800)}` : "",
  course.deepExplanation ? `شرح عميق:\n${trimText(course.deepExplanation.introduction, 1600)}` : "",
].filter(Boolean).join("\n\n");

const buildKnowledgeWindow = (ctx: TutorContext, latestQuestion: string): string => {
  const tokens = tokenizeSearch(latestQuestion);
  const catalog = ctx.courses.map(buildCourseDigest).join("\n\n");
  const selected = ctx.courseId ? ctx.courses.find((course) => course.id === ctx.courseId) : undefined;
  if (selected) {
    return [
      "# فهرس الأكاديمية الكامل:",
      catalog,
      "",
      "# محتوى الدورة المختارة بالتفصيل:",
      buildDetailedCourseContext(selected),
    ].join("\n");
  }

  const scored = ctx.courses
    .map((course) => ({ course, score: scoreCourseForQuestion(course, latestQuestion, tokens) }))
    .sort((a, b) => b.score - a.score);
  const relevant = scored.filter((entry) => entry.score > 0).slice(0, 6).map((entry) => entry.course);

  return [
    "# فهرس الأكاديمية الكامل:",
    catalog,
    "",
    "# المحتوى التفصيلي الأكثر صلة بسؤال المتعلم:",
    relevant.length > 0
      ? relevant.map(buildDetailedCourseContext).join("\n\n---\n\n")
      : "لم يطابق السؤال دورة محددة؛ استخدم الفهرس الكامل للإجابة العامة، واطلب توضيحاً إذا احتجت تحديد أسبوع أو محاضرة.",
  ].join("\n");
};

const buildSystemPrompt = (mode: TutorMode, ctx: TutorContext, latestQuestion: string) => {
  return [
    BASE_SYSTEM_PROMPT,
    buildModeInstructions(mode),
    buildCourseAwarenessSection(ctx),
    buildCitationInstruction(),
    "",
    "# قاعدة المعرفة — المواد الكاملة لأكاديمية الإحسان:",
    buildKnowledgeWindow(ctx, latestQuestion),
    "",
    "# سياق الدورة المُختارة:",
    ctx.courseContext,
    "",
    "# ذاكرة المتعلّم:",
    chatMemory.getMemorySummary(),
  ].join("\n");
};

const getModel = (): string =>
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";

const getProxyUrl = (): string =>
  (import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined) || "/api/gemini";

export const hasApiKey = (): boolean => Boolean(getProxyUrl());

// === Main API call to Gemini ===
const callGemini = async (
  history: TutorMessage[],
  mode: TutorMode,
  ctx: TutorContext,
  onChunk?: (text: string) => void,
  imageDataUrl?: string,
): Promise<{ text: string; citations?: { courseId: string; conceptIds?: string[] }[]; confidence?: number; suggestedFollowUps?: string[] }> => {
  const model = getModel();

  const latestUserText = history.filter((message) => message.role === "user").slice(-1)[0]?.text ?? "";
  const systemPrompt = buildSystemPrompt(mode, ctx, latestUserText);

  // Build Gemini contents array
  const contents: any[] = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "فهمت. أنا معلّم أكاديمية الإحسان، جاهز للعمل بالوضع المطلوب: " + mode }] },
  ];

  // Add history (with optional images)
  for (const [index, m] of history.entries()) {
    const isLatestLearnerMessage = index === history.length - 1 && m.role === "user";
    const text = isLatestLearnerMessage
      ? `سؤال المتعلم الحالي:\n${m.text}\n\nأجب عن سؤال المتعلم الحالي مباشرة، واستعمل قاعدة المعرفة فقط عندما تساعد على الإجابة. لا تنتقل إلى موضوع آخر، ولا تكرر إجابة سابقة.`
      : m.text;
    const parts: any[] = [{ text }];
    if (m.imageDataUrl) {
      parts.push({ inline_data: { mime_type: "image/jpeg", data: m.imageDataUrl.split(",")[1] || m.imageDataUrl } });
    }
    contents.push({ role: m.role === "user" ? "user" : "model", parts });
  }

  const generationConfig = {
    temperature: 0.65,
    topP: 0.95,
    maxOutputTokens: 4096,
  };

  const proxyUrl = getProxyUrl();
  let res: Response;

  const proxyBody = JSON.stringify({
    contents,
    generationConfig,
    model,
  });

  if (proxyUrl) {
    res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: proxyBody,
    });
  } else {
    throw new Error("NO_API_KEY");
  }

  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${t.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunkText) {
          fullText += chunkText;
          onChunk?.(fullText);
        }
      } catch {
        // Ignore partial SSE lines
      }
    }
  }

  if (!fullText) throw new Error("Empty response from Gemini");

  // Extract citations from response
  const citationsMatch = fullText.match(/\[CITATIONS\](.*?)\[\/CITATIONS\]/s);
  let citations: { courseId: string; conceptIds?: string[] }[] | undefined;
  let confidence: number | undefined;
  let suggestedFollowUps: string[] | undefined;

  if (citationsMatch) {
    try {
      const parsed = JSON.parse(citationsMatch[1].trim());
      citations = parsed.citations;
      confidence = parsed.confidence;
      suggestedFollowUps = parsed.suggestedFollowUps;
      // Strip citations from visible text
      fullText = fullText.replace(/\[CITATIONS\].*?\[\/CITATIONS\]/s, "").trim();
    } catch {}
  }

  return { text: fullText, citations, confidence, suggestedFollowUps };
};

// === Public API ===
export const sendToTutor = async (
  history: TutorMessage[],
  mode: TutorMode,
  ctx: TutorContext,
  onChunk?: (text: string) => void,
  imageDataUrl?: string,
): Promise<TutorResult> => {
  // Record what was discussed for memory
  if (ctx.courseId) {
    const last = history.filter(m => m.role === "user").slice(-1)[0]?.text;
    if (last) chatMemory.recordTopic(ctx.weekId, ctx.courseId, last.substring(0, 200));
  }

  try {
    const { text, citations, confidence, suggestedFollowUps } = await callGemini(history, mode, ctx, onChunk, imageDataUrl);

    // Generate fallback smart suggestions if model didn't provide any
    let finalSuggestions = suggestedFollowUps;
    if (!finalSuggestions || finalSuggestions.length === 0) {
      const course = ctx.courses.find(c => c.id === ctx.courseId);
      finalSuggestions = generateSmartSuggestions(text, mode, course);
    }

    return {
      ok: true,
      text,
      source: "gemini",
      citations,
      confidence,
      suggestedFollowUps: finalSuggestions,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const text =
      "تعذّر الاتصال بالذكاء الاصطناعي الآن. لم أقدّم إجابة محلية أو قالباً بديلاً حتى لا تظهر إجابات غير مولّدة من Gemini. راجع إعداد GEMINI_API_KEY على الخادم ثم أعد المحاولة.";
    onChunk?.(text);
    return { ok: false, text, source: "error", error: message };
  }
};

export const TUTOR_MODES: { id: TutorMode; label: string; description: string; icon: string }[] =
  [
    { id: "teach", label: "علّمني", description: "يشرح بأسلوب قصصي روحي.", icon: "🎓" },
    { id: "ask", label: "اسأل", description: "يبدق بالاستشهاد.", icon: "❓" },
    { id: "quiz", label: "اختبرني", description: "يولّد أسئلة فورية.", icon: "📝" },
    { id: "simple", label: "بسّط", description: "تبسيط عميق بكلمات سهلة.", icon: "💧" },
    { id: "deep", label: "شرح معمّق", description: "تفصيل أكاديمي مع التّخريج.", icon: "🔬" },
    { id: "connect", label: "اربط", description: "يوضّح جسور الدورات.", icon: "🔗" },
    { id: "plan", label: "خطة", description: "يصمم لك خطة مخصصة.", icon: "🗺️" },
    { id: "revise", label: "مراجعة", description: "ملخص مكثف.", icon: "⚡" },
    { id: "reflect", label: "تأمّل", description: "أسئلة تحوّل العلم لسلوك.", icon: "🪞" },
    { id: "exam", label: "اختبار", description: "اختبار نهائي مكثّف.", icon: "🎯" },
  ];
