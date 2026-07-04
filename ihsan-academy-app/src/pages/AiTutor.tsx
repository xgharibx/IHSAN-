import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useCourses } from "@/hooks/useWeekHooks";
import { sendToTutor, hasApiKey, TUTOR_MODES, type TutorMode, type TutorMessage } from "@/services/aiTutor";
import { buildCourseContext } from "@/services/smartSuggestions";
import { chatMemory } from "@/services/chatMemory";
import { data } from "@/data";
import { Icons } from "@/components/Icons";
import { ChatMessage, ImagePreview } from "@/components/ChatMessage";
import { VoiceInput } from "@/components/VoiceInput";
import { ChatSessionList } from "@/components/ChatSessionList";
import { renderMarkdown } from "@/services/markdownRenderer";

const SESSION_PREFIX = "ai-tutor-";
const ACADEMY_SCOPE = "__academy_all__";

export default function AiTutor() {
  const [params] = useSearchParams();
  const initialCourse = params.get("course");
  const navigate = useNavigate();
  const currentWeekCourses = useCourses();
  const courseEntries = useMemo(
    () =>
      Object.values(data.weeks).flatMap((bundle) =>
        bundle.courses.map((course) => ({
          course,
          weekNumber: bundle.meta.number,
          weekTitle: bundle.meta.title,
        })),
      ),
    [],
  );
  const courses = useMemo(() => courseEntries.map((entry) => entry.course), [courseEntries]);
  const coursesByWeek = useMemo(
    () =>
      Object.values(data.weeks).map((bundle) => ({
        weekNumber: bundle.meta.number,
        weekTitle: bundle.meta.title,
        courses: bundle.courses,
      })),
    [],
  );
  const initialCourseValue =
    (initialCourse &&
      (currentWeekCourses.find((c) => c.id === initialCourse || c.slug === initialCourse)?.slug ??
        courseEntries.find((entry) => entry.course.id === initialCourse || entry.course.slug === initialCourse)?.course.slug)) ||
    ACADEMY_SCOPE;
  const [mode, setMode] = useState<TutorMode>("teach");
  const [courseId, setCourseId] = useState<string>(initialCourseValue);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingCitations, setStreamingCitations] = useState<{ courseId: string; conceptIds?: string[] }[] | null>(null);
  const [streamingConfidence, setStreamingConfidence] = useState<number | null>(null);
  const [streamingFollowUps, setStreamingFollowUps] = useState<string[] | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatSessions = useStore((s) => s.chatSessions);
  const activeSessionId = useStore((s) => s.activeSessionId);
  const appendAi = useStore((s) => s.appendAi);
  const resetAi = useStore((s) => s.resetAi);
  const createChatSession = useStore((s) => s.createChatSession);
  const switchChatSession = useStore((s) => s.switchChatSession);

  // Resolve effective session id (fallback to "default" if not in store)
  const effectiveSessionId = chatSessions.some(s => s.id === activeSessionId) ? activeSessionId : "default";

  // History for current session
  const history = useStore((s) => {
    const id = chatSessions.some(cs => cs.id === activeSessionId) ? activeSessionId : "default";
    return s.aiSessions[id] ?? [];
  });

  useEffect(() => {
    setHasKey(hasApiKey());
    // Record mode preference
    if (mode) chatMemory.recordModePreference(mode);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, streamingText]);

  // Build course context once per render
  const selectedCourseEntry = courseEntries.find((entry) => entry.course.slug === courseId);
  const course = selectedCourseEntry?.course;
  const ctx = {
    weekId: selectedCourseEntry?.weekNumber ?? 0,
    courses,
    courseId: course?.id ?? null,
    knowledgeBase: "",
    courseContext: buildCourseContext(course),
    relevantConceptIds: course?.relatedConcepts ?? [],
  };

  const send = async (text: string, img?: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setStreamingText("");
    setStreamingCitations(null);
    setStreamingConfidence(null);
    setStreamingFollowUps(null);

    // Ensure there's a session
    let sid = effectiveSessionId;
    if (!chatSessions.some(s => s.id === sid)) {
      sid = createChatSession(course?.id ?? null, mode);
    }

    const userMsg: TutorMessage = { role: "user", text, imageDataUrl: img };
    appendAi(sid, userMsg);
    setInput("");
    setImageDataUrl(null);

    try {
      const res = await sendToTutor([...history, userMsg], mode, ctx, (partial) => {
        setStreamingText(partial);
      }, img);
      appendAi(sid, {
        role: "model",
        text: res.text,
        citations: res.citations,
        confidence: res.confidence,
        suggestedFollowUps: res.suggestedFollowUps,
      } as any);
      if (res.citations) setStreamingCitations(res.citations);
      if (res.confidence !== undefined) setStreamingConfidence(res.confidence);
      if (res.suggestedFollowUps) setStreamingFollowUps(res.suggestedFollowUps);
      if (course) chatMemory.recordCourseVisit(course.id);
      if (selectedCourseEntry) chatMemory.recordWeekVisit(selectedCourseEntry.weekNumber);
    } catch (e) {
      appendAi(sid, {
        role: "model",
        text: "حدث خطأ غير متوقّع. حاول مرة أخرى.",
      });
    } finally {
      setBusy(false);
      setStreamingText(null);
      setStreamingCitations(null);
      setStreamingConfidence(null);
      setStreamingFollowUps(null);
    }
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setInput(text);
    } else {
      setInput(text);
    }
  };

  const courseColor = course?.scrollColor ?? "#2f9e64";

  // Smart suggestions based on mode + course
  const suggested = course ? [
    `اشرح لي ${course.title} بأسلوب مبسط.`,
    `ما أهم 5 مفاهيم في هذه الدورة؟`,
    `أنشئ لي اختبارًا قصيرًا عن ${course.title}.`,
    `كيف أربط ${course.title} بدورات أخرى في هذا الأسبوع؟`,
    `ما الأخطاء الشائعة في فهم ${course.title}؟`,
  ] : [
    "اشرح لي فكرة الأسبوع بأسلوب مبسط.",
    "ما أهم 5 دروس من هذا الأسبوع؟",
    "اختبرني بسؤال متوسط الصعوبة.",
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <div className="mb-5">
        <div className="pill mb-2">المعلّم الذكي · AI Tutor</div>
        <h1 className="font-display text-3xl text-sand-50 sm:text-4xl">معلّمك الذكي يفهم مواد الأسبوع</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-sand-100/60">
          10 أوضاع تعليمية، 3 مَرَاتب يَقين، ذاكرة دائمة، 9 دورات، 165 سؤالاً، 804 بطاقة، 428 مفهوم.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <label className="mb-2 block text-xs text-sand-100/55" htmlFor="academy-scope">
          نطاق المعلّم
        </label>
        <select
          id="academy-scope"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 text-sm text-sand-100"
        >
          <option value={ACADEMY_SCOPE}>كل الأكاديمية - كل الأسابيع والمحاضرات</option>
          {coursesByWeek.map((weekGroup) => (
            <optgroup key={weekGroup.weekNumber} label={`الأسبوع ${weekGroup.weekNumber} - ${weekGroup.weekTitle}`}>
              {weekGroup.courses.map((c) => (
                <option key={`${weekGroup.weekNumber}-${c.slug}`} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {!hasKey && (
        <div className="mb-4 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-3 text-xs text-sand-100/80 sm:text-sm">
          <div className="flex items-start gap-3">
            <Icons.Sparkles size={16} className="mt-0.5 shrink-0 text-gold-300" />
            <div>
              <div className="font-medium text-gold-200">وضع المحادثة المحلية مفعّل</div>
              <p className="mt-0.5 text-sand-100/60">
                لم يتم العثور على مفتاح Gemini. أضف <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">GEMINI_API_KEY</code> في <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code> للحصول على إجابات مولّدة بالذكاء الاصطناعي.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_220px]">
        {/* LEFT SIDEBAR: Sessions */}
        <aside className="order-3 space-y-3 lg:order-1">
          <div className="card p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-sand-100/50">
              <span>المحادثات</span>
              <button
                onClick={() => createChatSession(course?.id ?? null, mode, "محادثة جديدة")}
                className="rounded p-1 text-gold-300 hover:bg-gold-300/10"
                title="محادثة جديدة"
              >
                ＋
              </button>
            </div>
            <ChatSessionList currentSessionId={effectiveSessionId} onSelect={switchChatSession} />
          </div>
        </aside>

        {/* CENTER: Chat */}
        <div className="order-1 card flex h-[78vh] min-h-[500px] flex-col lg:order-2">
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
          >
            {history.length === 0 && (
              <div className="grid h-full place-items-center px-2 text-center text-sand-100/60">
                <div className="max-w-md">
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-300/30 to-emerald-glow/20">
                    <Icons.Sparkles size={26} className="text-gold-300" />
                  </div>
                  <h3 className="font-display text-xl text-sand-50">أهلًا بك في رحلتك مع المعلّم</h3>
                  <p className="mt-2 text-xs">
                    أنا معلّمك الذكي. اختر الوضع المناسب، اكتب سؤالك، أو انقر على اقتراح.
                  </p>
                  <div className="mt-4 grid gap-1.5">
                    {suggested.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-right text-xs text-sand-100/80 transition-all hover:border-gold-300/30"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {history.map((m: any, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                text={m.text}
                timestamp={m.ts}
                citations={m.citations}
                confidence={m.confidence}
                suggestedFollowUps={m.suggestedFollowUps}
                courseColor={courseColor}
                courseTitle={m.role === "model" ? course?.title : undefined}
                onFollowUpClick={(q) => send(q)}
                onCitationClick={(cid) => navigate(`/course/${courseEntries.find(entry => entry.course.id === cid)?.course.slug ?? cid}`)}
                onImagePreview={(d) => setPreviewImage(d)}
                imageDataUrl={m.imageDataUrl}
              />
            ))}
            {busy && streamingText !== null && (
              <ChatMessage
                role="model"
                text={streamingText}
                timestamp={Date.now()}
                citations={streamingCitations ?? undefined}
                confidence={streamingConfidence ?? undefined}
                suggestedFollowUps={streamingFollowUps ?? undefined}
                courseColor={courseColor}
                courseTitle={course?.title}
                onFollowUpClick={(q) => send(q)}
                onCitationClick={(cid) => navigate(`/course/${courseEntries.find(entry => entry.course.id === cid)?.course.slug ?? cid}`)}
                onImagePreview={(d) => setPreviewImage(d)}
              />
            )}
            {busy && !streamingText && (
              <div className="flex justify-end">
                <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300" style={{ animationDelay: "0.15s" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image preview */}
          {imageDataUrl && (
            <div className="border-t border-white/5 bg-white/[0.02] p-2">
              <div className="flex items-center gap-2 text-xs text-sand-100/60">
                <img src={imageDataUrl} alt="مرفق" className="h-12 w-12 rounded border border-white/10 object-cover" />
                <span className="flex-1 truncate">مرفق صورة</span>
                <button
                  onClick={() => setImageDataUrl(null)}
                  className="rounded p-1 text-rose-glow hover:bg-rose-glow/10"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-white/5 p-2 sm:p-3">
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.04] text-sand-100/70 transition-all hover:bg-gold-300/15 hover:text-gold-200"
                title="إرفاق صورة"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <VoiceInput onTranscript={handleVoiceTranscript} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input, imageDataUrl ?? undefined);
                  }
                }}
                rows={2}
                placeholder="اكتب سؤالك للمعلّم الذكي… (يدعم الإدخال الصوتي والصور)"
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-sand-100 placeholder:text-sand-100/30 focus:border-gold-300/40 focus:outline-none"
              />
              <button
                onClick={() => send(input, imageDataUrl ?? undefined)}
                disabled={!input.trim() || busy}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-700 text-ink-950 transition-all disabled:opacity-30"
              >
                <Icons.ArrowLeft size={16} className="flip-x" />
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-sand-100/40">
              Enter للإرسال · Shift+Enter لسطر جديد · 🎤 صوت · 📎 صورة
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Settings */}
        <aside className="order-2 space-y-3 lg:order-3">
          <div className="card p-3">
            <div className="text-xs text-sand-100/50">اختر الدورة</div>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-sand-100"
            >
              <option value={ACADEMY_SCOPE}>كل الأكاديمية - كل الأسابيع والمحاضرات</option>
              {coursesByWeek.map((weekGroup) => (
                <optgroup key={weekGroup.weekNumber} label={`الأسبوع ${weekGroup.weekNumber} - ${weekGroup.weekTitle}`}>
                  {weekGroup.courses.map((c) => (
                    <option key={`${weekGroup.weekNumber}-${c.slug}`} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="card p-3">
            <div className="mb-2 text-xs text-sand-100/50">الوضع</div>
            <div className="grid grid-cols-1 gap-1">
              {TUTOR_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as TutorMode)}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-right text-xs transition-all ${
                    mode === m.id
                      ? "border-gold-300/40 bg-gold-300/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="font-medium text-sand-50">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-3">
            <button
              onClick={() => {
                if (confirm("حذف هذه المحادثة؟")) resetAi(effectiveSessionId);
              }}
              className="btn btn-outline w-full text-xs"
            >
              محادثة جديدة
            </button>
          </div>

          <div className="card p-3 text-[10px] text-sand-100/40">
            <div className="mb-1 font-medium text-sand-100/60">نصيحة ذكية</div>
            <div>اختر دورة قبل الإرسال. المعلّم سيُركّز على محتواها كمرجع أساسي.</div>
          </div>
        </aside>
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <ImagePreview dataUrl={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
}
