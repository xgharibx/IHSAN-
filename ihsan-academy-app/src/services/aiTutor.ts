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
//  - Rich local fallback that uses actual course content (not just hardcoded facts)

import {
  type Course,
} from "@/types";
import { chatMemory } from "./chatMemory";
import { buildCourseContext, pickRelevantConcepts, generateSmartSuggestions } from "./smartSuggestions";

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
  source: "gemini" | "local-fallback";
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
  if (!ctx.courseId) return "";
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

const buildSystemPrompt = (mode: TutorMode, ctx: TutorContext) => {
  return [
    BASE_SYSTEM_PROMPT,
    buildModeInstructions(mode),
    buildCourseAwarenessSection(ctx),
    buildCitationInstruction(),
    "",
    "# قاعدة المعرفة — المواد الكاملة لأكاديمية الإحسان:",
    ctx.knowledgeBase,
    "",
    "# سياق الدورة المُختارة:",
    ctx.courseContext,
    "",
    "# ذاكرة المتعلّم:",
    chatMemory.getMemorySummary(),
  ].join("\n");
};

const getBrowserKey = (): string | undefined => {
  return (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || undefined;
};

const getModel = (): string =>
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";

const getEndpoint = (): string =>
  (import.meta.env.VITE_GEMINI_ENDPOINT as string | undefined) ||
  "https://generativelanguage.googleapis.com";

const getProxyUrl = (): string =>
  (import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined) || "/api/gemini";

export const hasApiKey = (): boolean => Boolean(getBrowserKey()) || Boolean(getProxyUrl());

// === Build a local fallback that uses actual course content ===
const localFallback = (mode: TutorMode, history: TutorMessage[], ctx: TutorContext): string => {
  const last = history.filter((m) => m.role === "user").slice(-1)[0]?.text ?? "";
  const course = ctx.courses.find((c) => c.id === ctx.courseId);

  // Try to find a relevant concept in the question
  const relevantConcept = pickRelevantConcepts(last, course, 1);
  let conceptResponse = "";
  if (relevantConcept[0]) {
    const c = relevantConcept[0];
    conceptResponse = `

📚 من محتوى "${c.name}":
${c.definition}

${c.deepExplanation?.substring(0, 600) ?? ""}${c.deepExplanation && c.deepExplanation.length > 600 ? "..." : ""}`;
  }

  if (mode === "quiz") {
    return course
      ? `سؤال تجريبي من "${course.title}":

س: ما الفكرة الجوهرية في هذه الدورة؟
أ) البناء الروحي الإيماني ✅
ب) الخوف من الله
ج) الثروة المادية
د) القوة السياسية

(ملاحظة: هذا رد محلي. أضف VITE_GEMINI_API_KEY في ملف .env للحصول على إجابات مولّدة بالذكاء الاصطناعي وتخصيص كامل.)${conceptResponse}`
      : "اختر دورة أولاً. ملاحظة: أضف VITE_GEMINI_API_KEY في .env للحصول على إجابات أعمق.";
  }

  if (mode === "plan") {
    return `خطة دراسة مقترحة:

📚 الدورات في ${course ? course.title : "الأسبوع"}:
1) ابدأ بمشاهدة الشرح العميق (45-60 دقيقة).
2) راجع البطاقات المسردة (20-30 دقيقة).
3) أجِب اختبارات سريعة على المفاهيم.
4) طبّق ما تعلّمت في حياتك اليومية.

💡 نصيحة: ابدأ بدورة واحدة، لا تتشتت. كرّرها حتى تشعر بالاستيعاب.

(ملاحظة: هذا رد محلي. أضف VITE_GEMINI_API_KEY في .env لتوليد خطة مخصصة كاملة.)`;
  }

  if (mode === "revise") {
    if (course) {
      return `ملخص سريع - ${course.title}:

📌 أهم 5 محاور:
${course.mustUnderstand?.slice(0, 5).map((m, i) => `${i + 1}) ${m}`).join("\n") ?? "—"}

💡 أمثلة من الحياة:
${course.realLifeExamples?.slice(0, 2).map((e) => `• ${e.substring(0, 100)}...`).join("\n") ?? "—"}

أعِدها بدون النظر.${conceptResponse}`;
    }
  }

  if (mode === "reflect") {
    return `تأمّل شخصي:
${course ? `فكّر في "${course.title}".` : "فكّر في الأسبوع."}

أسئلة تأملية:
1) ما المفهوم الذي يَترك أثرًا في حياتك الآن؟
2) كيف تَطبّقه هذا الأسبوع؟
3) ما الذي يمنعك من تطبيقه فعليًا؟

في الإسلام، العلم بلا عمل وبال، والعمل بغير علم ضلال. التزم بالعلم والعمل معًا.${conceptResponse}`;
  }

  // Default response for ask / teach / deep / simple
  if (course) {
    return `شكرًا لسؤالك.

📚 من "${course.title}":
${course.summary}

${conceptResponse || (course.keyTerms?.slice(0, 3).map((t) => `• ${t.term}: ${t.definition}`).join("\n") || "")}

(ملاحظة: هذا رد محلي بدون API. أضف VITE_GEMINI_API_KEY في .env للحصول على إجابات مولّدة بالذكاء الاصطناعي ومخصّصة لكل سؤال.)`;
  }

  return `للسؤال: "${last.slice(0, 200)}"

بدون مفتاح API، يمكنني تقديم محتوى محدود. أضف VITE_GEMINI_API_KEY في .env للحصول على إجابات مولّدة بالذكاء الاصطناعي.`;
};

// === Main API call to Gemini ===
const callGemini = async (
  history: TutorMessage[],
  mode: TutorMode,
  ctx: TutorContext,
  onChunk?: (text: string) => void,
  imageDataUrl?: string,
): Promise<{ text: string; citations?: { courseId: string; conceptIds?: string[] }[]; confidence?: number; suggestedFollowUps?: string[] }> => {
  const model = getModel();
  const endpoint = getEndpoint();

  const systemPrompt = buildSystemPrompt(mode, ctx);

  // Build Gemini contents array
  const contents: any[] = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "فهمت. أنا معلّم أكاديمية الإحسان، جاهز للعمل بالوضع المطلوب: " + mode }] },
  ];

  // Add history (with optional images)
  for (const m of history) {
    const parts: any[] = [{ text: m.text }];
    if (m.imageDataUrl) {
      parts.push({ inline_data: { mime_type: "image/jpeg", data: m.imageDataUrl.split(",")[1] || m.imageDataUrl } });
    }
    contents.push({ role: m.role === "user" ? "user" : "model", parts });
  }

  // Add current user message (with optional image)
  const userParts: any[] = [{ text: history[history.length - 1]?.text || "" }];
  if (imageDataUrl) {
    userParts.push({ inline_data: { mime_type: "image/jpeg", data: imageDataUrl.split(",")[1] || imageDataUrl } });
  }
  contents.push({ role: "user", parts: userParts });

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 4096,
    thinkingConfig: { thinkingBudget: 0 },
  };

  const proxyUrl = getProxyUrl();
  const browserKey = getBrowserKey();
  let res: Response;

  const proxyBody = JSON.stringify({
    contents,
    generationConfig,
    model,
  });

  const useLocalDirect = Boolean(browserKey && import.meta.env.DEV && !import.meta.env.VITE_GEMINI_PROXY_URL);

  if (useLocalDirect && browserKey) {
    const directBody = JSON.stringify({ contents, generationConfig });
    const url = `${endpoint}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${browserKey}`;
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: directBody,
    });
  } else if (proxyUrl) {
    res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: proxyBody,
    });
  } else if (browserKey) {
    const directBody = JSON.stringify({ contents, generationConfig });
    const url = `${endpoint}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${browserKey}`;
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: directBody,
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
    if (message === "NO_API_KEY") {
      const text = localFallback(mode, history, ctx);
      onChunk?.(text);
      return { ok: true, text, source: "local-fallback", error: "NO_API_KEY" };
    }
    // Network error — use local fallback
    const text = localFallback(mode, history, ctx) + `\n\n(تعذّر الوصول إلى Gemini: ${message})`;
    onChunk?.(text);
    return { ok: true, text, source: "local-fallback", error: message };
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
