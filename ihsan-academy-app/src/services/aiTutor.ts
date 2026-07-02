// AI Tutor service — abstraction layer that can be plugged into Gemini, OpenAI, or a local model.
// For now: calls Gemini's REST API directly (browser fetch) so the user only needs to set VITE_GEMINI_API_KEY.
// If no key is set, the tutor gracefully returns a clear "no key" state and uses a small built-in local fallback.

import { buildKnowledgeBase } from "@/data";

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

const MODE_PROMPTS: Record<TutorMode, string> = {
  teach:
    "أنت معلّم أكاديمية الإحسان. علّم المتعلم بأسلوب قصصي بسيط وروحي. ابدأ بالتعريف ثم التطبيق ثم المثال.",
  ask:
    "أنت مساعد ذكي يجيب عن أسئلة المتعلم بدقّة وبالاعتماد على مواد الأسبوع الأول. إذا لم تجد الإجابة في المواد، قل ذلك بوضوح واعرض تفسيرًا عامًّا محايدًا.",
  quiz:
    "أنت مولّد اختبارات. أنشئ سؤالًا واحدًا في كل مرة مع 4 خيارات وصحّح الإجابة. نبّه على مكان الخطأ بلطف.",
  simple:
    "أنت مُبسِّط. اشرح المفاهيم بأسلوب سهل وممتع مع مثال من الحياة اليومية.",
  deep:
    "أنت محقّق أكاديمي. أعطِ شرحًا عميقًا مع الاستشهاد بالآيات والأحاديث والترقيم الدقيق للمفاهيم.",
  connect:
    "أنت موحِّد المعرفة. اربط بين دورات الأسبوع الأول، وأشِر إلى الجسور الفكرية بينها. اعرض العلاقات بأسلوب بصري كلما أمكن.",
  plan:
    "أنت مخطط تعلّم. اقترح خطة درس أسبوعية واضحة للمتعلم وفق مستواه وأهدافه.",
  revise:
    "أنت مساعد مراجعة. لخّص أهم 5 نقاط من الدورة أو المفهوم واطلب من المتعلم اختبار نفسه.",
  reflect:
    "أنت مرشد تأمّلي. اطرح أسئلة تأملية تساعد المتعلم على تحويل المعلومة إلى سلوك.",
  exam:
    "أنت ممتحن نهائي. صمّم اختبارًا قصيرًا مكثّفًا عن الدورة المطلوبة، 5 أسئلة متنوعة مع تقييم الإجابات.",
};

const SYSTEM_BASE = `أنت معلّم ومرشد أكاديمية الإحسان في الأسبوع الأول. مهمتك: تعليم، تبسيط، ربط، مراجعة، تأمل، امتحان. اعتمد على المواد المرفقة (قاعدة المعرفة). إذا سُئلت عن شيء خارج نطاق الأسبوع الأول، قل بوضوح: "هذا خارج نطاق مواد الأسبوع الأول، يمكنني تقديم تفسير عام بحذر"، ثم قدّم تفسيرًا عامًا قصيرًا. لا تختلق معلومات تخصّ النصوص القرآنية أو الأحاديث. استشهد بذكر الآيات والأحاديث كما وردت في قاعدة المعرفة دون اجتهاد إضافي. لا تتكلم بلسان ملكي أو وعظي ثقيل، كن دافئًا ومركّزًا.

أسلوبك في الإجابة: قدّم إجابة كاملة وغير مبتورة أبدًا — لا تختصر أو تقطع الإجابة في المنتصف. كن تفاعليًا وحيويًا: استخدم عناوين فرعية قصيرة وقوائم نقطية وأمثلة واقعية عند الحاجة لتنظيم الإجابة الطويلة. اربط دائمًا بمثال من الحياة اليومية عندما يكون ذلك مناسبًا. اختم الإجابات الطويلة بخلاصة قصيرة أو سؤال تأملي يدفع المتعلم للتفكير أو التطبيق. لا تكرر نفس الجمل الافتتاحية في كل رد.

قاعدة المعرفة المرفقة:
`;

const buildSystemPrompt = (mode: TutorMode) => {
  return `${SYSTEM_BASE}\n\n[وضع المعلم]: ${MODE_PROMPTS[mode]}\n\n${buildKnowledgeBase()}`;
};

export interface TutorMessage {
  role: "user" | "model";
  text: string;
}

const getKey = (): string | undefined => {
  // Vite injects only env vars prefixed with VITE_ to the client bundle.
  return (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || undefined;
};

const getModel = (): string =>
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";

const getEndpoint = (): string =>
  (import.meta.env.VITE_GEMINI_ENDPOINT as string | undefined) ||
  "https://generativelanguage.googleapis.com";

export const hasApiKey = (): boolean => Boolean(getKey());

export interface TutorResult {
  ok: boolean;
  text: string;
  source: "gemini" | "local-fallback";
  error?: string;
}

const localFallback = (mode: TutorMode, history: TutorMessage[]): string => {
  const last = history.filter((m) => m.role === "user").slice(-1)[0]?.text ?? "";
  if (mode === "quiz") {
    return `سؤال تجريبي (يعمل بدون مفتاح API):

س: ما تعريف الإحسان في حديث جبريل؟
أ) الإتقان المهني
ب) أن تعبد الله كأنك تراه ✅
ج) كثرة العبادة
د) الزهد في الدنيا

الشرح: الإحسان في حديث جبريل: 'أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك'.`;
  }
  if (mode === "revise") {
    return `أهم 5 نقاط للإحسان:
1. الإحسان = حضور + أحسن عمل.
2. ليس مجرد إتقان مهني بل مراقبة الله.
3. العبادة بُعدان: تقديس وتعمير.
4. عقد الخلافة قائم عليك من يوم ولادتك.
5. الفراغ الوجودي دواؤه الإحسان.

أعِدها بدون النظر وراجع نفسك.`;
  }
  if (mode === "plan") {
    return `خطة دراسة مقترحة (بدون مفتاح API):
1. ابدأ بـ دورة "الإحسان ومنازل الروح" — 60 دقيقة.
2. ثم "التفسير" — 45 دقيقة.
3. ثم "السيرة النبوية" — 60 دقيقة.
4. ثم الدورات التطبيقية (5-9) — 45 دقيقة لكل واحدة.

استخدم بطاقات المراجعة بعد كل دورة.`;
  }
  if (last.includes("الفاتحة") || last.includes("أم القرآن")) {
    return `الفاتحة تسمى "أم القرآن" لأنها جامعة لمقاصد القرآن الخمسة: (1) معرفة الله، (2) الكون الدال على الله، (3) أسماء الله وصفاته، (4) يوم الجزاء، (5) قصص السابقين. سميت "السبع المثاني" لأنها تتكرر 17 مرة في اليوم والليلة. لها عند السيوطي 20 اسمًا.

(ملاحظة: هذا رد محلي. أضف مفتاح VITE_GEMINI_API_KEY في ملف .env للحصول على إجابات أعمق.)`;
  }
  if (last.includes("أبو بكر") || last.includes("الصديق")) {
    return `أبو بكر الصديق: عبد الله بن أبي قحافة، أول من أسلم من الرجال. سُمي الصديق لتصديقه النبي ﷺ في الإسراء والمعراج. أنفق كل ثروته (من 40,000 إلى 5,000 درهم) في سبيل الله. قاتل المرتدين ومانعي الزكاة. جمع القرآن في مصحف واحد. تُوفي سنة 13 هـ.`;
  }
  if (last.includes("خديجة")) {
    return `خديجة بنت خويلد: أم المؤمنين، أول من آمن من المسلمين جميعًا. من سادة قريش وأكبر تجارهم. قالت للنبي ﷺ عند نزول الوحي: 'والله لا يخزيك الله أبدًا'. أنجبت القاسم، زينب، رقية، أم كلثوم، فاطمة، عبد الله. تُوفيت في عام الحزن.`;
  }
  if (last.includes("الفتح") || last.includes("الغزوة") || last.includes("الجهاد")) {
    return `الفرق: الغزوة ما قصده النبي ﷺ بنفسه، السرية ما بعثه ولم يحضره. الفتح افتتاح + استقرار + رحمة. المعركة احتكاك قتالي بدون النبي ﷺ. الجهاد أوسع من القتال — يشمل الأمر بالمعروف والدعوة وتهذيب النفس. كل قتال جهاد وليس كل جهاد قتالًا.`;
  }
  return `سؤالك: "${last.slice(0, 200)}"

للحصول على إجابة كاملة مولّدة بالذكاء الاصطناعي، أضف مفتاح VITE_GEMINI_API_KEY في ملف .env.

في الوضع الحالي يمكنني مساعدتك في:
- شرح مفاهيم الأسبوع الأول (الإحسان، التفسير، السيرة، الفقه، ...)
- توليد اختبارات تجريبية
- مراجعة سريعة
- خطة دراسة مقترحة
- تأملات

جرّب سؤالًا محددًا عن دورة من دورات الأسبوع الأول.`;
};

const callGemini = async (
  history: TutorMessage[],
  mode: TutorMode,
  onChunk?: (textSoFar: string) => void,
): Promise<string> => {
  const key = getKey();
  if (!key) throw new Error("NO_API_KEY");
  const model = getModel();
  const endpoint = getEndpoint();

  const systemPrompt = buildSystemPrompt(mode);

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "فهمت. أنا معلّم أكاديمية الإحسان وجاهز للمساعدة." }] },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
  ];

  const body = JSON.stringify({
    contents,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 8192,
      // Gemini 2.5 models spend part of the token budget on invisible internal
      // "thinking" before producing the visible answer — this alone was the
      // cause of both slow (~8s) responses AND answers getting cut short
      // (thinking silently ate most of maxOutputTokens). Disabling it makes
      // responses both much faster and fully complete.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  // Stream the response so the UI can show text as it's generated, instead of
  // waiting for the entire answer before displaying anything.
  const url = `${endpoint}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
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
    buffer = lines.pop() ?? ""; // last (possibly incomplete) line stays buffered
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
        // Ignore partial/malformed SSE lines (can happen mid-chunk-boundary).
      }
    }
  }

  if (!fullText) throw new Error("Empty response from Gemini");
  return fullText;
};

export const sendToTutor = async (
  history: TutorMessage[],
  mode: TutorMode,
  onChunk?: (textSoFar: string) => void,
): Promise<TutorResult> => {
  try {
    const text = await callGemini(history, mode, onChunk);
    return { ok: true, text, source: "gemini" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "NO_API_KEY") {
      const text = localFallback(mode, history);
      onChunk?.(text);
      return {
        ok: true,
        text,
        source: "local-fallback",
        error: "NO_API_KEY",
      };
    }
    // Network or other error → graceful local fallback
    const text = localFallback(mode, history) + `\n\n(تعذّر الوصول إلى Gemini: ${message})`;
    onChunk?.(text);
    return {
      ok: true,
      text,
      source: "local-fallback",
      error: message,
    };
  }
};

export const TUTOR_MODES: { id: TutorMode; label: string; description: string; icon: string }[] =
  [
    { id: "teach", label: "علّمني", description: "يشرح لك المفاهيم بأسلوب قصصي.", icon: "🎓" },
    { id: "ask", label: "اسأل أي شيء", description: "أجب عن أسئلتك بدقة.", icon: "❓" },
    { id: "quiz", label: "اختبرني", description: "يولّد أسئلة فورية.", icon: "📝" },
    { id: "simple", label: "بسّط لي", description: "تبسيط عميق بكلمات سهلة.", icon: "💧" },
    { id: "deep", label: "شرح معمّق", description: "تفصيل أكاديمي.", icon: "🔬" },
    { id: "connect", label: "اربط الدورات", description: "يوضح العلاقات بين الدورات.", icon: "🔗" },
    { id: "plan", label: "خطة دراسة", description: "يصمم لك خطة مخصصة.", icon: "🗺️" },
    { id: "revise", label: "مراجعة سريعة", description: "أهم 5 نقاط.", icon: "⚡" },
    { id: "reflect", label: "تأمّل", description: "أسئلة تأملية تحوّل العلم لسلوك.", icon: "🪞" },
    { id: "exam", label: "تحضير للاختبار", description: "اختبار نهائي مكثّف.", icon: "🎯" },
  ];
