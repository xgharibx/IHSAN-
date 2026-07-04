import { useState, useMemo } from "react";
import { useCourses, useFlashcards, useQuizzes } from "@/hooks/useWeekHooks";
import { useStore } from "@/store/useStore";
import { Icons } from "@/components/Icons";
import type { AnyQuestion } from "@/types";

type Tab = "flashcards" | "mcq" | "tf" | "fitb" | "match" | "short" | "reflect" | "scenario";

export default function Study() {
  const courses = useCourses();
  const [tab, setTab] = useState<Tab>("flashcards");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const tabs: { id: Tab; label: string }[] = [
    { id: "flashcards", label: "البطاقات" },
    { id: "mcq", label: "اختيار من متعدد" },
    { id: "tf", label: "صح / خطأ" },
    { id: "fitb", label: "املأ الفراغ" },
    { id: "match", label: "مزاوجة" },
    { id: "short", label: "إجابة قصيرة" },
    { id: "reflect", label: "تأمّل" },
    { id: "scenario", label: "سيناريو" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <div className="pill mb-3">بطاقات واختبارات</div>
        <h1 className="font-display text-4xl text-sand-50">مراجعة وتقييم</h1>
        <p className="mt-2 text-sand-100/60">
          راجع بطاقاتك، اختبر نفسك، تابع تقدّمك.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? "btn-primary" : "btn-outline"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-sand-100/50">الدورة:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sand-100"
          >
            <option value="all">الكل</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sand-100/50">المستوى:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sand-100"
          >
            <option value="all">الكل</option>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>
      </div>

      {tab === "flashcards" && (
        <FlashcardDeck courseFilter={courseFilter} />
      )}
      {tab !== "flashcards" && (
        <QuizPanel
          tab={tab}
          courseFilter={courseFilter}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  );
}

function FlashcardDeck({ courseFilter }: { courseFilter: string }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const markFlashcard = useStore((s) => s.markFlashcard);
  const cards = useFlashcards();
  const visibleCards = useMemo(() => {
    return cards.filter((c) => courseFilter === "all" || c.courseId === courseFilter);
  }, [cards, courseFilter]);

  if (visibleCards.length === 0)
    return <div className="card p-6 text-center text-sand-100/60">لا توجد بطاقات</div>;

  const card = visibleCards[index];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
      <div
        className="card relative h-80 cursor-pointer overflow-hidden p-8"
        onClick={() => {
          setFlipped((f) => !f);
          markFlashcard(card.courseId, card.id);
        }}
      >
        <div className="absolute right-4 top-4 pill">{card.term}</div>
        <div className="grid h-full place-items-center text-center">
          {flipped ? (
            <div>
              <div className="font-display text-2xl text-sand-50">{card.deep}</div>
              <div className="mt-4 max-w-xl text-sm text-sand-100/60">{card.example}</div>
              <div className="mt-4 text-xs text-cyan-300/80">
                <span className="ml-1">🜲</span> {card.memoryHook}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-display text-3xl text-sand-50">{card.term}</div>
              <div className="mt-3 max-w-md text-base text-sand-100/70">{card.simple}</div>
              <div className="mt-8 text-xs text-sand-100/40">انقر لقلب البطاقة</div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="card p-4">
          <div className="text-xs text-sand-100/50">تقدّم</div>
          <div className="mt-1 font-display text-2xl text-sand-50">
            {index + 1}
            <span className="text-sm text-sand-100/40"> / {visibleCards.length}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gold-300"
              style={{ width: `${((index + 1) / visibleCards.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline flex-1"
            disabled={index === 0}
            onClick={() => {
              setIndex((i) => Math.max(0, i - 1));
              setFlipped(false);
            }}
          >
            السابق
          </button>
          <button
            className="btn btn-primary flex-1"
            disabled={index >= visibleCards.length - 1}
            onClick={() => {
              setIndex((i) => Math.min(visibleCards.length - 1, i + 1));
              setFlipped(false);
            }}
          >
            التالي
          </button>
        </div>
        <button
          className="btn btn-outline w-full"
          onClick={() => {
            setIndex(0);
            setFlipped(false);
          }}
        >
          إعادة البدء
        </button>
      </div>
    </div>
  );
}

function QuizPanel({
  tab,
  courseFilter,
  difficultyFilter,
}: {
  tab: Tab;
  courseFilter: string;
  difficultyFilter: string;
}) {
  const questions = useQuizzes();
  const courses = useCourses();
  const visible = useMemo(() => {
    return questions.filter((q) => {
      if (q.type !== tab) return false;
      if (courseFilter !== "all" && q.courseId !== courseFilter) return false;
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [questions, tab, courseFilter, difficultyFilter]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const recordQuiz = useStore((s) => s.recordQuizAnswer);

  if (visible.length === 0)
    return (
      <div className="card p-6 text-center text-sand-100/60">
        لا توجد أسئلة بهذه المعايير. جرّب دورة أو مستوى آخر.
      </div>
    );

  const q = visible[i];
  const course = courses.find((c) => c.id === q.courseId);

  return (
    <div>
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-sand-100/50">
          <div className="flex items-center gap-2">
            <span className="pill" style={{ color: course?.scrollColor, borderColor: `${course?.scrollColor}40` }}>
              {course?.title}
            </span>
            <span>{q.difficulty === "easy" ? "سهل" : q.difficulty === "medium" ? "متوسط" : "صعب"}</span>
          </div>
          <div>
            سؤال {i + 1} / {visible.length}
          </div>
        </div>
        <h2 className="mt-4 font-display text-2xl text-sand-50">{q.prompt}</h2>

        {q.type === "mcq" && "options" in q && (
          <div className="mt-6 grid gap-2">
            {q.options.map((o) => {
              const isPicked = picked === o.id;
              const isCorrect = q.correctAnswer === o.id;
              const show = picked !== null;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    if (picked) return;
                    setPicked(o.id);
                    recordQuiz(q.courseId, isCorrect);
                  }}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-right transition-all ${
                    show && isCorrect
                      ? "border-emerald-glow bg-emerald-glow/10"
                      : show && isPicked
                        ? "border-rose-glow bg-rose-glow/10"
                        : isPicked
                          ? "border-gold-300/40 bg-gold-300/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <span className="text-sand-50">{o.text}</span>
                  {show && isCorrect && <Icons.Check size={18} className="text-emerald-glow" />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "tf" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { id: "true", label: "صحيح" },
              { id: "false", label: "خطأ" },
            ].map((opt) => {
              const isPicked = picked === opt.id;
              const isCorrect = q.correctAnswer === opt.id;
              const show = picked !== null;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (picked) return;
                    setPicked(opt.id);
                    recordQuiz(q.courseId, isCorrect);
                  }}
                  className={`rounded-xl border p-6 text-center text-lg font-bold transition-all ${
                    show && isCorrect
                      ? "border-emerald-glow bg-emerald-glow/10"
                      : show && isPicked
                        ? "border-rose-glow bg-rose-glow/10"
                        : isPicked
                          ? "border-gold-300/40 bg-gold-300/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "fitb" && <FitbQuestion q={q} onAnswer={(ok) => recordQuiz(q.courseId, ok)} />}

        {q.type === "match" && "pairs" in q && <MatchQuestion q={q} onAnswer={(ok) => recordQuiz(q.courseId, ok)} />}

        {(q.type === "short" || q.type === "scenario" || q.type === "reflect" || q.type === "explain") && (
          <div className="mt-6">
            <textarea
              rows={5}
              placeholder="اكتب إجابتك هنا..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-sand-100 focus:border-gold-300/40 focus:outline-none"
              onChange={(e) => {
                if (e.target.value.length > 20 && !picked) setPicked("answered");
              }}
            />
            {picked === "answered" && (
              <div className="mt-4 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-4 text-sm text-sand-100/80">
                <div className="font-display text-base text-gold-200">إجابة نموذجية:</div>
                <p className="mt-2">{q.correctAnswer}</p>
                {q.explanation && (
                  <div className="mt-3 text-sand-100/60">{q.explanation}</div>
                )}
              </div>
            )}
          </div>
        )}

        {picked && (
          <div className="mt-6 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-4 text-sm">
            <div className="text-sand-100/80">{q.explanation}</div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setI((x) => (x + 1) % visible.length);
              setPicked(null);
            }}
            className="btn btn-primary"
            disabled={!picked && (q.type === "mcq" || q.type === "tf")}
          >
            السؤال التالي
            <Icons.ArrowLeft size={16} className="flip-x" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FitbQuestion({ q, onAnswer }: { q: AnyQuestion; onAnswer: (ok: boolean) => void }) {
  const [val, setVal] = useState("");
  const target = q.correctAnswer.trim();
  const ok = val.trim() === target;
  return (
    <div className="mt-4 space-y-3">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="اكتب الكلمة الناقصة"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-sand-100 focus:border-gold-300/40 focus:outline-none"
      />
      <button onClick={() => onAnswer(ok)} className="btn btn-primary">
        تحقّق
      </button>
      {val.length > 0 && (
        <div
          className={`rounded-2xl border p-3 text-sm ${
            ok ? "border-emerald-glow/40 bg-emerald-glow/10" : "border-rose-glow/40 bg-rose-glow/10"
          }`}
        >
          {ok ? "إجابة صحيحة!" : `الإجابة الصحيحة: ${target}`}
        </div>
      )}
    </div>
  );
}

function MatchQuestion({ q, onAnswer }: { q: AnyQuestion; onAnswer: (ok: boolean) => void }) {
  if (q.type !== "match") return null;
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const rights = [...q.pairs].map((p) => p.right).sort();

  const handleLeft = (left: string) => {
    setSelected(left);
  };
  const handleRight = (right: string) => {
    if (!selected) return;
    setMatches((m) => ({ ...m, [selected]: right }));
    setSelected(null);
  };

  const complete = Object.keys(matches).length === q.pairs.length;
  const allCorrect = complete && q.pairs.every((p) => matches[p.left] === p.right);
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {q.pairs.map((p) => (
          <button
            key={p.left}
            onClick={() => handleLeft(p.left)}
            disabled={matches[p.left] !== undefined}
            className={`w-full rounded-xl border p-3 text-right text-sm transition-all ${
              selected === p.left
                ? "border-gold-300/40 bg-gold-300/10"
                : matches[p.left]
                  ? "border-emerald-glow/30 bg-emerald-glow/10"
                  : "border-white/5 bg-white/[0.02]"
            }`}
          >
            {p.left}
            {matches[p.left] && (
              <span className="mt-1 block text-xs text-emerald-glow">↔ {matches[p.left]}</span>
            )}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rights.map((r) => {
          const used = Object.values(matches).includes(r);
          return (
            <button
              key={r}
              onClick={() => handleRight(r)}
              disabled={used}
              className={`w-full rounded-xl border p-3 text-right text-sm transition-all ${
                used
                  ? "border-emerald-glow/30 bg-emerald-glow/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>
      {complete && (
        <div className="col-span-2">
          <button
            onClick={() => onAnswer(allCorrect)}
            className={`btn ${allCorrect ? "btn-primary" : "btn-outline"}`}
          >
            تحقّق
          </button>
        </div>
      )}
    </div>
  );
}
