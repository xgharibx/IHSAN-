import { Link, useParams, Navigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { data, getCourseBySlug, getFlashcardsForCourse, getQuestionsForCourse } from "@/data";
import { useStore } from "@/store/useStore";
import { CourseIcon, Icons } from "@/components/Icons";
import { gsap } from "gsap";
import { scrollTo as lenisScrollTo } from "@/services/lenis";
import type {
  Course,
  ConceptDeep,
  CourseLongSummary,
  CourseDeepDive,
  StudyGuide,
  DeepDiveExplanation,
} from "@/types";

type TabId =
  | "overview"
  | "lessons"
  | "key-terms"
  | "deep-concepts"
  | "long-summary"
  | "deep-dive"
  | "study-guide"
  | "review";

interface TabDef {
  id: TabId;
  label: string;
  icon: keyof typeof Icons;
  count?: number;
}

export default function CourseDetail() {
  const { slug } = useParams();
  const course = slug ? getCourseBySlug(slug) : undefined;
  const setRecent = useStore((s) => s.setRecent);
  const markStarted = useStore((s) => s.markStarted);
  const markSectionRead = useStore((s) => s.markSectionRead);
  const cp = useStore((s) => (course ? s.courseProgress[course.id] : undefined));
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (course) {
      markStarted(course.id);
      setRecent(course.id);
    }
  }, [course, markStarted, setRecent]);

  // Reset to the overview tab whenever the visitor navigates to a different course.
  useEffect(() => {
    setActiveTab("overview");
  }, [course?.id]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Note: only animate position, never opacity — if this tween gets interrupted
      // (e.g. by React StrictMode's dev-mode double-effect-invoke), content must
      // never be left invisible. Worst case here is a missed slide-in, not hidden text.
      gsap.from(".cd-fade", {
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "transform",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [course?.id]);

  const tabs = useMemo<TabDef[]>(() => {
    if (!course) return [];
    const list: TabDef[] = [
      { id: "overview", label: "نظرة عامة", icon: "Compass" },
      { id: "lessons", label: "الدروس", icon: "Book", count: course.sections.length },
      { id: "key-terms", label: "المفاهيم الأساسية", icon: "Diamond", count: course.keyTerms.length },
    ];
    if (course.deepConcepts && course.deepConcepts.length > 0) {
      list.push({ id: "deep-concepts", label: "مفاهيم متعمّقة", icon: "Brain", count: course.deepConcepts.length });
    }
    if (course.longSummary) {
      list.push({ id: "long-summary", label: "الملخّص الطويل", icon: "Scale", count: course.longSummary.sections.length });
    }
    if (course.deepExplanation) {
      const total =
        course.deepExplanation.explanations.length +
        course.deepExplanation.phases.reduce((acc, p) => acc + p.explanations.length, 0);
      list.push({ id: "deep-dive", label: "الشرح العميق", icon: "Sparkles", count: total || undefined });
    }
    if (course.studyGuide) {
      list.push({ id: "study-guide", label: "دليل الدراسة", icon: "Rocket" });
    }
    list.push({ id: "review", label: "للمراجعة", icon: "Shield" });
    return list;
  }, [course]);

  if (!course) return <Navigate to="/courses" replace />;

  const relatedCourses = course.relatedCourses
    .map((id) => data.week1.courses.find((c) => c.id === id))
    .filter(Boolean) as typeof data.week1.courses;

  const flashcardCount = getFlashcardsForCourse(course.id).length;
  const questionCount = getQuestionsForCourse(course.id).length;
  const readSections = cp?.completedSections ?? [];

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-white/5"
        style={{ background: `linear-gradient(180deg, ${course.scrollColor}10 0%, transparent 100%)` }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Link to="/courses" className="cd-fade inline-flex items-center gap-2 text-sm text-sand-100/60 hover:text-sand-50">
            <Icons.ArrowLeft size={16} className="flip-x" /> الدورات
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="cd-fade flex items-center gap-3">
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl"
                  style={{ background: `${course.scrollColor}25`, color: course.scrollColor }}
                >
                  <CourseIcon name={course.iconKey} size={28} />
                </div>
                <div>
                  <div className="pill">{course.domain}</div>
                  <div className="mt-1 text-sm text-sand-100/60">
                    {course.speaker} · {course.duration}
                  </div>
                </div>
              </div>
              <h1 className="cd-fade mt-5 font-display text-4xl text-sand-50 sm:text-5xl">
                {course.title}
              </h1>
              <p className="cd-fade mt-3 text-xl text-sand-100/70">{course.subtitle}</p>
              <p className="cd-fade mt-4 text-base text-sand-100/60">{course.tagline}</p>
              <div className="cd-fade mt-6 flex flex-wrap items-center gap-3">
                <Link to={`/tutor?course=${course.id}`} className="btn btn-outline">
                  <span className="text-gold-300">✦</span> المعلّم الذكي
                </Link>
              </div>
            </div>
            <div className="cd-fade grid grid-cols-3 gap-2 text-center">
              <Tile label="أقسام" value={course.sections.length.toString()} />
              <Tile label="بطاقات" value={flashcardCount.toString()} />
              <Tile label="أسئلة" value={questionCount.toString()} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Mobile / tablet tab bar — horizontal, scrollable */}
        <div className="cd-fade mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              tab={t}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              compact
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar (desktop tab navigation) */}
          <aside className="cd-fade hidden lg:block lg:sticky lg:top-32 lg:self-start">
            <div className="card p-4">
              <div className="mb-3 text-xs text-sand-100/50">محتويات الدورة</div>
              <ul className="space-y-1">
                {tabs.map((t) => (
                  <li key={t.id}>
                    <TabButton tab={t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                  </li>
                ))}
              </ul>
              <div className="divider-gold my-4" />
              <div className="text-xs text-sand-100/50">روابط سريعة</div>
              <div className="mt-2 flex flex-col gap-1">
                <Link to="/study" className="rounded-lg px-3 py-1.5 text-sm text-sand-100/80 hover:bg-white/5">
                  ◧ بطاقات واختبارات
                </Link>
                <Link to="/activities" className="rounded-lg px-3 py-1.5 text-sm text-sand-100/80 hover:bg-white/5">
                  ✺ الأنشطة
                </Link>
              </div>
            </div>
          </aside>

          {/* Body: exactly one tab panel is shown at a time */}
          <div>
            <div key={activeTab} className="tab-panel">
              {activeTab === "overview" && <OverviewPanel course={course} />}
              {activeTab === "lessons" && (
                <LessonsPanel
                  course={course}
                  readSections={readSections}
                  onRead={(sectionId) => markSectionRead(course.id, sectionId)}
                />
              )}
              {activeTab === "key-terms" && <KeyTermsPanel course={course} />}
              {activeTab === "deep-concepts" && course.deepConcepts && (
                <DeepConceptsPanel concepts={course.deepConcepts} />
              )}
              {activeTab === "long-summary" && course.longSummary && (
                <LongSummaryPanel summary={course.longSummary} />
              )}
              {activeTab === "deep-dive" && course.deepExplanation && (
                <DeepDivePanel deep={course.deepExplanation} />
              )}
              {activeTab === "study-guide" && course.studyGuide && (
                <StudyGuidePanel guide={course.studyGuide} />
              )}
              {activeTab === "review" && <ReviewPanel course={course} />}
            </div>

            {/* Related — always visible below the active tab, it's page navigation, not tab content */}
            {relatedCourses.length > 0 && (
              <section className="card mt-6 p-6 sm:p-8">
                <h2 className="font-display text-2xl text-sand-50">دورات مرتبطة</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {relatedCourses.map((rc) => (
                    <Link
                      key={rc.id}
                      to={`/course/${rc.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-gold-300/30"
                    >
                      <div
                        className="grid h-10 w-10 place-items-center rounded-lg"
                        style={{ background: `${rc.scrollColor}20`, color: rc.scrollColor }}
                      >
                        <CourseIcon name={rc.iconKey} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-sand-50">{rc.title}</div>
                        <div className="truncate text-xs text-sand-100/50">{rc.subtitle}</div>
                      </div>
                      <Icons.ArrowLeft size={16} className="flip-x text-sand-100/50" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick,
  compact,
}: {
  tab: TabDef;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = Icons[tab.icon];
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
          active
            ? "border-gold-300/40 bg-gold-300/15 text-gold-200"
            : "border-white/10 bg-white/[0.02] text-sand-100/70 hover:border-white/20"
        }`}
      >
        <Icon size={14} />
        {tab.label}
        {tab.count !== undefined && <span className="text-sand-100/40">· {tab.count}</span>}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-sm transition-all ${
        active ? "bg-gold-300/15 text-gold-200" : "text-sand-100/70 hover:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {tab.label}
      </span>
      {tab.count !== undefined && <span className="text-xs text-sand-100/40">{tab.count}</span>}
    </button>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="font-display text-2xl text-sand-50">{value}</div>
      <div className="text-[11px] text-sand-100/60">{label}</div>
    </div>
  );
}

function OverviewPanel({ course }: { course: Course }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-2xl text-sand-50">نظرة عامة</h2>
      <p className="mt-4 text-base leading-loose text-sand-100/80">{course.summary}</p>
      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">أهداف التعلّم</h3>
      <ul className="mt-3 space-y-2 text-sand-100/80">
        {course.learningObjectives.map((o) => (
          <li key={o} className="flex items-start gap-2">
            <Icons.Check size={18} className="mt-0.5 text-emerald-glow" />
            <span>{o}</span>
          </li>
        ))}
      </ul>
      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">المخرجات المتوقّعة</h3>
      <ul className="mt-3 space-y-2 text-sand-100/80">
        {course.outcomes.map((o) => (
          <li key={o} className="flex items-start gap-2">
            <Icons.Sparkles size={18} className="mt-0.5 text-gold-300" />
            <span>{o}</span>
          </li>
        ))}
      </ul>
      {course.heroQuote && (
        <div className="mt-6 rounded-2xl border border-gold-300/20 bg-gold-300/5 p-5">
          <div className="font-display text-2xl text-gold-200">"{course.heroQuote.text}"</div>
          <div className="mt-2 text-sm text-sand-100/60">— {course.heroQuote.source}</div>
        </div>
      )}
      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">مراجعة سريعة</h3>
      <ul className="mt-3 space-y-2">
        {course.quickRevision.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sand-100/80">
            <Icons.Sparkles size={18} className="mt-0.5 text-gold-300" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">المواد المرفقة</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {course.files.map((f) => (
          <div
            key={f.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-xs uppercase">
                {f.type}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm text-sand-50">{f.name}</div>
                <div className="truncate text-xs text-sand-100/50">{f.purpose}</div>
              </div>
            </div>
            <span className="pill shrink-0 text-[10px]">مرجع</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LessonsPanel({
  course,
  readSections,
  onRead,
}: {
  course: Course;
  readSections: string[];
  onRead: (sectionId: string) => void;
}) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-sand-50">دروس المحاضرة</h2>
        <span className="pill text-[10px]">
          {readSections.length} / {course.sections.length} مقروءة
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {course.sections.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => lenisScrollTo(`#s-${s.id}`, { offset: -100 })}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
              readSections.includes(s.id)
                ? "border-emerald-glow/30 bg-emerald-glow/10 text-emerald-glow"
                : "border-white/10 bg-white/[0.02] text-sand-100/70 hover:border-gold-300/30"
            }`}
          >
            <span>{idx + 1}</span>
            <span className="max-w-[10rem] truncate">{s.title}</span>
            {readSections.includes(s.id) && <Icons.Check size={12} />}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-6">
        {course.sections.map((s) => (
          <div
            key={s.id}
            id={`s-${s.id}`}
            className="scroll-mt-28 border-t border-white/5 pt-6 first:border-t-0 first:pt-0"
          >
            <h3 className="font-display text-xl text-sand-50">{s.title}</h3>
            <div className="prose-arabic mt-3 max-w-none">
              {s.body.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {s.quote && (
              <div className="mt-5 rounded-2xl border-r-4 border-gold-300/60 bg-gold-300/5 p-5">
                <div className="font-display text-xl text-gold-200">"{s.quote}"</div>
                {s.source && <div className="mt-2 text-sm text-sand-100/60">— {s.source}</div>}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => onRead(s.id)} className="btn btn-outline text-xs">
                <Icons.Check size={14} />
                {readSections.includes(s.id) ? "مقروء" : "تمّت قراءته"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeyTermsPanel({ course }: { course: Course }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-2xl text-sand-50">المفاهيم الأساسية</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {course.keyTerms.map((t) => (
          <div key={t.term} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="font-display text-lg text-gold-200">{t.term}</h4>
            <p className="mt-1 text-sm text-sand-100/80">{t.definition}</p>
            <p className="mt-2 text-sm text-sand-100/50">{t.deepMeaning}</p>
            <div className="mt-3 text-xs text-cyan-300/80">
              <span className="ml-1">🜲</span> {t.memoryHook}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DeepConceptsPanel({ concepts }: { concepts: ConceptDeep[] }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-2xl text-sand-50">مفاهيم متعمّقة</h2>
      <p className="mt-2 text-sm text-sand-100/50">
        تفكيك كامل لكل مفهوم: لماذا يهم، وأين يظهر في المحاضرة، وسوء الفهم الشائع حوله.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {concepts.map((c) => (
          <details
            key={c.id}
            className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 open:border-gold-300/20 open:bg-white/[0.04]"
          >
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-lg text-gold-200">{c.name}</h4>
                <Icons.Diamond size={14} className="shrink-0 text-gold-300/60" />
              </div>
              <p className="mt-1 text-sm text-sand-100/70">{c.simpleDefinition}</p>
            </summary>
            <div className="mt-3 space-y-3 border-t border-white/5 pt-3 text-sm">
              <p className="leading-loose text-sand-100/80">{c.deepExplanation}</p>
              <div>
                <div className="text-xs font-medium text-emerald-glow">لماذا يهم</div>
                <p className="mt-1 text-sand-100/70">{c.whyItMatters}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-cyan-300/80">أين في المحاضرة</div>
                <p className="mt-1 text-sand-100/70">{c.whereInLecture}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-sand-50">مثال</div>
                <p className="mt-1 text-sand-100/70">{c.example}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-rose-glow">سوء فهم شائع</div>
                <p className="mt-1 text-sand-100/70">{c.commonMisunderstanding}</p>
              </div>
              <div className="rounded-lg bg-gold-300/5 p-2 text-xs text-gold-200">{c.revisionNote}</div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function LongSummaryPanel({ summary }: { summary: CourseLongSummary }) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl text-sand-50">{summary.title}</h2>
        <span className="pill text-[10px]">{summary.sections.length} قسمًا</span>
      </div>
      {summary.subtitle && <p className="mt-1 text-sm text-sand-100/60">{summary.subtitle}</p>}
      <p className="mt-4 leading-loose text-sand-100/80">{summary.introduction}</p>
      <div className="divider-gold my-6" />
      <div className="space-y-2">
        {summary.sections.map((s, i) => (
          <details
            key={s.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 open:bg-white/[0.04]"
          >
            <summary className="flex cursor-pointer items-center gap-2 text-sand-50">
              <span className="text-xs text-sand-100/40">{i + 1}</span>
              <span className="font-medium">{s.title}</span>
            </summary>
            <p className="mt-3 leading-loose text-sand-100/70">{s.summary}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function DeepDivePanel({ deep }: { deep: CourseDeepDive }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-2xl text-sand-50">{deep.title}</h2>
      {deep.introduction && <p className="mt-4 leading-loose text-sand-100/80">{deep.introduction}</p>}
      {deep.explanations.length > 0 && (
        <>
          <div className="divider-gold my-6" />
          <div className="space-y-3">
            {deep.explanations.map((e) => (
              <ExplanationCard key={e.id} item={e} />
            ))}
          </div>
        </>
      )}
      {deep.phases.map((phase) => (
        <div key={phase.phase}>
          <div className="divider-gold my-6" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill">المرحلة {phase.phase}</span>
            <h3 className="font-display text-xl text-gold-200">{phase.phaseLabel}</h3>
            <span className="text-xs text-sand-100/40">السطور {phase.transcriptLines}</span>
          </div>
          <div className="mt-4 space-y-3">
            {phase.explanations.map((e) => (
              <ExplanationCard key={e.id} item={e} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function StudyGuidePanel({ guide }: { guide: StudyGuide }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="font-display text-2xl text-sand-50">دليل الدراسة</h2>
      {guide.intro && <p className="mt-4 leading-loose text-sand-100/80">{guide.intro}</p>}

      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">قبل الدراسة</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs text-sand-100/50">ركّز على</div>
          <ul className="mt-2 space-y-1.5 text-sm text-sand-100/80">
            {guide.beforeStudying.focus.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.Sprout size={14} className="mt-1 shrink-0 text-emerald-glow" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-sand-100/50">اسأل نفسك</div>
          <ul className="mt-2 space-y-1.5 text-sm text-sand-100/80">
            {guide.beforeStudying.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.Moon size={14} className="mt-1 shrink-0 text-cyan-400" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 rounded-xl border border-gold-300/20 bg-gold-300/5 p-4 text-sm leading-loose text-sand-100/80">
        {guide.beforeStudying.mindset}
      </p>

      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">أثناء الدراسة</h3>
      <div className="mt-3 space-y-2">
        {Object.entries(guide.duringStudying).map(([key, phase], i) => (
          <details
            key={key}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 open:bg-white/[0.04]"
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sand-50">
              <span className="pill text-[10px]">المرحلة {i + 1}</span>
              <span className="text-xs text-sand-100/40">{phase.transcriptRange}</span>
            </summary>
            <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-sand-100/50">أهم الأفكار</div>
                <ul className="mt-2 space-y-1 text-sm text-sand-100/80">
                  {phase.mainThemes.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-sand-100/50">إرشادات</div>
                <ul className="mt-2 space-y-1 text-sm text-sand-100/80">
                  {phase.guidance.map((g, i) => (
                    <li key={i}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        ))}
      </div>

      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">بعد الدراسة</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs text-sand-100/50">قائمة مراجعة</div>
          <ul className="mt-2 space-y-1.5 text-sm text-sand-100/80">
            {guide.afterStudying.revisionChecklist.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.Check size={14} className="mt-1 shrink-0 text-emerald-glow" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-sand-100/50">اختبر نفسك</div>
          <ul className="mt-2 space-y-1.5 text-sm text-sand-100/80">
            {guide.afterStudying.selfTest.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.Diamond size={14} className="mt-1 shrink-0 text-gold-300" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs font-medium text-gold-200">مهمّة تأملية</div>
          <p className="mt-2 text-sm leading-loose text-sand-100/80">{guide.afterStudying.reflectionTask}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs font-medium text-emerald-glow">خطوة عملية</div>
          <p className="mt-2 text-sm leading-loose text-sand-100/80">{guide.afterStudying.practicalAction}</p>
        </div>
      </div>

      <div className="divider-gold my-6" />
      <h3 className="font-display text-lg text-gold-200">مراجعة سريعة</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-sand-100/50">الأساسيات</div>
          <ul className="mt-2 space-y-1 text-sm text-sand-100/80">
            {guide.quickReview.core.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-sand-100/50">احفظها</div>
          <ul className="mt-2 space-y-1 text-sm text-sand-100/80">
            {guide.quickReview.mustRemember.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-sand-100/50">للتأمل</div>
          <ul className="mt-2 space-y-1 text-sm text-sand-100/80">
            {guide.quickReview.reflective.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReviewPanel({ course }: { course: Course }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="card p-6">
        <h3 className="font-display text-lg text-sand-50">ما يجب أن تفهمه</h3>
        <ul className="mt-3 space-y-2 text-sm text-sand-100/80">
          {course.mustUnderstand.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <Icons.Diamond size={14} className="mt-1 text-gold-300" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <h3 className="font-display text-lg text-sand-50">أخطاء شائعة</h3>
        <ul className="mt-3 space-y-2 text-sm text-sand-100/80">
          {course.commonMistakes.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <Icons.Shield size={14} className="mt-1 text-rose-glow" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <h3 className="font-display text-lg text-sand-50">أمثلة من الحياة</h3>
        <ul className="mt-3 space-y-2 text-sm text-sand-100/80">
          {course.realLifeExamples.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <Icons.Sprout size={14} className="mt-1 text-emerald-glow" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <h3 className="font-display text-lg text-sand-50">أسئلة تأمّل</h3>
        <ul className="mt-3 space-y-2 text-sm text-sand-100/80">
          {course.reflectionQuestions.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <Icons.Moon size={14} className="mt-1 text-cyan-400" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExplanationCard({ item }: { item: DeepDiveExplanation }) {
  return (
    <details className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 open:bg-white/[0.04]">
      <summary className="cursor-pointer text-sand-50">
        <span className="font-medium">{item.title}</span>
        {item.transcriptRef && (
          <span className="mr-2 text-xs text-sand-100/40">({item.transcriptRef})</span>
        )}
      </summary>
      <div className="mt-3 space-y-3 border-t border-white/5 pt-3 text-sm">
        <p className="leading-loose text-sand-100/80">{item.explanation}</p>
        <div>
          <div className="text-xs font-medium text-emerald-glow">لماذا يهم</div>
          <p className="mt-1 text-sand-100/70">{item.whyItMatters}</p>
        </div>
        <div>
          <div className="text-xs font-medium text-rose-glow">سوء فهم شائع</div>
          <p className="mt-1 text-sand-100/70">{item.misunderstanding}</p>
        </div>
        <div>
          <div className="text-xs font-medium text-gold-200">كيف تُطبّقه</div>
          <p className="mt-1 text-sand-100/70">{item.howToApply}</p>
        </div>
        <div>
          <div className="text-xs font-medium text-cyan-300/80">فكّر في هذا</div>
          <p className="mt-1 text-sand-100/70">{item.thinkAboutThis}</p>
        </div>
      </div>
    </details>
  );
}
