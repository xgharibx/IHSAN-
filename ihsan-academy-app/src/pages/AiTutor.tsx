import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { data } from "@/data";
import { useStore } from "@/store/useStore";
import { sendToTutor, hasApiKey, TUTOR_MODES, type TutorMode, type TutorMessage } from "@/services/aiTutor";
import { Icons } from "@/components/Icons";

const SESSION_ID = "ai-tutor-default";

export default function AiTutor() {
  const [params] = useSearchParams();
  const initialCourse = params.get("course");
  const [mode, setMode] = useState<TutorMode>("teach");
  const [courseId, setCourseId] = useState<string>(initialCourse ?? "ihsan-soul");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const history = useStore((s) => s.aiSessions[SESSION_ID] ?? []);
  const appendAi = useStore((s) => s.appendAi);
  const resetAi = useStore((s) => s.resetAi);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasKey(hasApiKey());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, streamingText]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setStreamingText("");
    const userMsg: TutorMessage = { role: "user", text };
    appendAi(SESSION_ID, userMsg);
    setInput("");
    try {
      const res = await sendToTutor([...history, userMsg], mode, (partial) => {
        setStreamingText(partial);
      });
      appendAi(SESSION_ID, { role: "model", text: res.text });
    } catch (e) {
      appendAi(SESSION_ID, {
        role: "model",
        text: "حدث خطأ غير متوقّع. حاول مرة أخرى.",
      });
    } finally {
      setBusy(false);
      setStreamingText(null);
    }
  };

  const course = data.week1.courses.find((c) => c.id === courseId);
  const suggested = [
    `اشرح لي ${course?.title} بأسلوب مبسط.`,
    `ما أهم 5 مفاهيم في هذه الدورة؟`,
    `أنشئ لي اختبارًا قصيرًا عن ${course?.title}.`,
    `كيف أربط ${course?.title} بباقي دورات الأسبوع الأول؟`,
    `ما الأخطاء الشائعة في فهم ${course?.title}؟`,
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="pill mb-3">المعلّم الذكي</div>
        <h1 className="font-display text-4xl text-sand-50">معلّمك الذكي يفهم مواد الأسبوع</h1>
        <p className="mt-2 max-w-3xl text-sand-100/60">
          عشرة أوضاع تعليمية: علّم، اسأل، اختبر، بسّط، اشرح معمّقًا، اربط، خطط، راجع، تأمّل، امتحن.
        </p>
      </div>

      {!hasKey && (
        <div className="mb-4 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-4 text-sm text-sand-100/80">
          <div className="flex items-start gap-3">
            <Icons.Sparkles size={18} className="mt-0.5 text-gold-300" />
            <div>
              <div className="font-medium text-gold-200">وضع المحادثة المحلية مفعّل</div>
              <p className="mt-1 text-sand-100/60">
                لم يتم العثور على مفتاح Gemini في الإعدادات. أضف
                <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">VITE_GEMINI_API_KEY</code>
                في ملف <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code> للحصول
                على إجابات مولّدة بالذكاء الاصطناعي. حاليًا، سيُجيب المعلّم بإجابات مختصرة ومفيدة.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <div className="card p-4">
            <div className="text-xs text-sand-100/50">اختر الدورة</div>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-sand-100"
            >
              {data.week1.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="card p-4">
            <div className="mb-2 text-xs text-sand-100/50">وضع المعلّم</div>
            <div className="grid grid-cols-2 gap-1.5">
              {TUTOR_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-right transition-all ${
                    mode === m.id
                      ? "border-gold-300/40 bg-gold-300/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{m.icon}</span>
                    <span className="text-xs font-medium text-sand-50">{m.label}</span>
                  </div>
                  <div className="hidden text-[10px] leading-tight text-sand-100/50 sm:block lg:block">
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <button
              onClick={() => resetAi(SESSION_ID)}
              className="btn btn-outline w-full text-xs"
            >
              محادثة جديدة
            </button>
          </div>
        </aside>

        <div className="order-1 card flex h-[75vh] max-h-[640px] min-h-[420px] flex-col lg:order-2 lg:h-[640px]">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
          >
            {history.length === 0 && (
              <div className="grid h-full place-items-center text-center text-sand-100/60">
                <div className="max-w-md">
                  <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-300/30 to-emerald-glow/20">
                    <Icons.Sparkles size={28} className="text-gold-300" />
                  </div>
                  <h3 className="font-display text-xl text-sand-50">أهلًا بك!</h3>
                  <p className="mt-2 text-sm">
                    أنا معلّمك الذكي. اختر الوضع المناسب، اكتب سؤالك، أو انقر على اقتراح.
                  </p>
                  <div className="mt-4 grid gap-1.5">
                    {suggested.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-right text-xs text-sand-100/80 transition-all hover:border-gold-300/30"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {history.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gold-300/15 text-sand-50"
                      : "bg-white/[0.04] text-sand-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-sand-100">
                  {streamingText ? (
                    <div className="whitespace-pre-wrap">
                      {streamingText}
                      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-gold-300 align-text-bottom" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300 [animation-delay:0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gold-300 [animation-delay:0.3s]" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-white/5 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={2}
                placeholder="اكتب سؤالك للمعلّم الذكي…"
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm text-sand-100 focus:border-gold-300/40 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || busy}
                className="btn btn-primary"
              >
                <Icons.ArrowLeft size={18} className="flip-x" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-sand-100/40">
              اضغط Enter للإرسال · Shift+Enter لسطر جديد
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
