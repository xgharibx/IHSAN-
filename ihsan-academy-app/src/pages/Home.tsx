import { Link } from "react-router-dom";
import { getCourseById, data } from "@/data";
import { useStore, computeCourseProgressPercent } from "@/store/useStore";
import { CourseIcon, Icons } from "@/components/Icons";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCourses, useFlashcards, useQuizzes, useConcepts, useWeekMeta, useSynthesis, useActivities } from "@/hooks/useWeekHooks";

export default function Home() {
  const courses = useCourses();
  const flashcards = useFlashcards();
  const quizzes = useQuizzes();
  const activities = useActivities();
  const concepts = useConcepts();
  const meta = useWeekMeta();
  const synthesis = useSynthesis();
  const courseProgress = useStore((s) => s.courseProgress);
  const markStarted = useStore((s) => s.markStarted);
  const setRecent = useStore((s) => s.setRecent);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Note: only animate position, never opacity — a stuck/interrupted tween
      // (e.g. from React StrictMode's dev-mode double-effect-invoke) must never
      // leave real content invisible.
      gsap.from(".hero-fade", {
        y: 40,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "transform",
      });
      if (cardsRef.current) {
        gsap.from(cardsRef.current.querySelectorAll(".course-card"), {
          y: 50,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
        });
      }
      if (sectionsRef.current) {
        const reveals = sectionsRef.current.querySelectorAll(".reveal");
        reveals.forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => el.classList.add("in"),
          });
        });
      }
    });
    return () => ctx.revert();
  }, [meta.id]);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-gold-300/20 blur-[120px]" />
          <div className="absolute -left-40 top-60 h-96 w-96 rounded-full bg-emerald-glow/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-glow/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <div className="hero-fade flex flex-col items-start gap-2">
            <span className="pill">
              <span className="pulse-dot" />
              <span>{meta.title}</span>
            </span>
          </div>
          <h1 className="hero-fade mt-6 max-w-4xl font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            <span className="gold-text">أكاديمية الإحسان</span>
            <br />
            <span className="text-sand-50">نظام تعلّم ذكي</span>
            <br />
            <span className="text-sand-100/80 text-3xl sm:text-4xl md:text-5xl">
              يحوّل المواد إلى رحلة معرفية حيّة
            </span>
          </h1>
          <p className="hero-fade mt-8 max-w-2xl text-lg leading-loose text-sand-100/70">
            {synthesis.bigIdea} تصفّح الدورات، استكشف شجرة المعرفة،
            راجِع البطاقات، خُض الاختبارات، تحدّث مع المعلّم الذكي، واحتفل بكل إنجاز.
          </p>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-3">
            <Link to="/dashboard" className="btn btn-primary">
              ابدأ رحلتك
              <Icons.ArrowLeft size={18} className="flip-x" />
            </Link>
            <Link to="/knowledge-tree" className="btn btn-outline">
              شجرة المعرفة
            </Link>
            <Link to="/tutor" className="btn btn-outline">
              المعلّم الذكي
            </Link>
          </div>

          {/* Hero stats */}
          <div className="hero-fade mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="دورة" value={courses.length.toString()} />
            <StatCard label="بطاقة" value={flashcards.length.toString()} />
            <StatCard label="سؤال" value={quizzes.length.toString()} />
            <StatCard label="مفهوم" value={concepts.length.toString()} />
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section ref={cardsRef} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="pill mb-3">الدورات</div>
            <h2 className="font-display text-4xl text-sand-50">دورات {meta.title}</h2>
            <p className="mt-2 max-w-2xl text-sand-100/60">
              {courses.length} دورات تغطّي محاور هذا الأسبوع.
            </p>
          </div>
          <Link to="/courses" className="hidden sm:inline-flex btn btn-outline">
            عرض الكل
            <Icons.ArrowLeft size={16} className="flip-x" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const cp = courseProgress[c.id];
            const totalFC = flashcards.filter((f) => f.courseId === c.id).length;
            const totalAct = activities.filter((a) => a.courseId === c.id).length;
            const pct = computeCourseProgressPercent(cp, c.sections.length, totalFC, totalAct);
            return (
              <Link
                key={c.id}
                to={`/course/${c.slug}`}
                onClick={() => {
                  markStarted(c.id);
                  setRecent(c.id);
                }}
                className="course-card group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all duration-500 hover:border-gold-300/30 hover:shadow-glow"
              >
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(400px 200px at top right, ${c.scrollColor}25, transparent 60%)`,
                  }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl"
                    style={{ background: `${c.scrollColor}20`, color: c.scrollColor }}
                  >
                    <CourseIcon name={c.iconKey} size={24} />
                  </div>
                  <div className="text-left text-xs text-sand-100/50">{c.duration}</div>
                </div>
                <h3 className="relative mt-4 font-display text-xl text-sand-50">{c.title}</h3>
                <p className="relative mt-1 line-clamp-2 text-sm text-sand-100/60">
                  {c.subtitle}
                </p>
                <div className="relative mt-5 flex items-center justify-between text-xs">
                  <span className="text-sand-100/60">
                    {c.sections.length} أقسام · {totalFC} بطاقات
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: pct > 0 ? c.scrollColor : "#a8a29e" }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: c.scrollColor }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Module overview */}
      <section ref={sectionsRef} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="reveal mb-10 text-center">
          <div className="pill mx-auto mb-3">الوحدات</div>
          <h2 className="font-display text-4xl text-sand-50">ست وحدات تعمل معًا</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "شرح الدورات",
              desc: "شرح عميق لكل دورة من نصوص المحاضرات والـPDF والـPowerPoint.",
              to: "/courses",
              color: "#22824f",
            },
            {
              title: "ربط الدورات",
              desc: "شجرة معرفة بصرية توضح العلاقات بين الدورات والمفاهيم.",
              to: "/knowledge-tree",
              color: "#1aa084",
            },
            {
              title: "بطاقات واختبارات",
              desc: "راجع بطاقاتك، اختبر نفسك، تابع تقدّمك.",
              to: "/study",
              color: "#e25d8d",
            },
            {
              title: "الأنشطة والجدول",
              desc: "أنشطة عملية، رحلة أسبوعية، وإنجازات قابلة للفتح.",
              to: "/activities",
              color: "#22d3ee",
            },
            {
              title: "المعلّم الذكي",
              desc: `ذكاء اصطناعي يفهم مواد ${meta.title} ويشرح لك بحرفية.`,
              to: "/tutor",
              color: "#a78bfa",
            },
            {
              title: "التركيب الموحّد",
              desc: "الفكرة الجامعة، وقبل الأسبوع التالي، ومن أنت بعد هذا الأسبوع.",
              to: "/synthesis",
              color: "#f97316",
            },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="reveal group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/10"
            >
              <div
                className="mb-3 h-1 w-12 rounded-full"
                style={{ background: m.color }}
              />
              <h3 className="font-display text-xl text-sand-50">{m.title}</h3>
              <p className="mt-2 text-sm text-sand-100/60">{m.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: m.color }}>
                <span>استكشف</span>
                <Icons.ArrowLeft size={16} className="flip-x" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex flex-col items-start p-4">
      <div className="font-display text-3xl text-gold-200">{value}</div>
      <div className="mt-1 text-xs text-sand-100/60">{label}</div>
    </div>
  );
}
