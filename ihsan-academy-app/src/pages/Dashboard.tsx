import { Link } from "react-router-dom";
import { useCourses, useFlashcards, useQuizzes, useActivities, useSynthesis, useWeekMeta } from "@/hooks/useWeekHooks";
import { useStore, computeCourseProgressPercent } from "@/store/useStore";
import { CourseIcon, Icons } from "@/components/Icons";

export default function Dashboard() {
  const courses = useCourses();
  const flashcards = useFlashcards();
  const activities = useActivities();
  const synthesis = useSynthesis();
  const meta = useWeekMeta();
  const cp = useStore((s) => s.courseProgress);
  const unlocked = useStore((s) => s.unlockedAchievements);
  const { achievements: _a } = { achievements: [] as any };
  void _a;

  const totalSections = courses.reduce((acc, c) => acc + c.sections.length, 0);
  const totalCompleted = Object.values(cp).reduce(
    (acc, c) => acc + c.completedSections.length,
    0,
  );
  const overallPct = totalSections ? Math.round((totalCompleted / totalSections) * 100) : 0;

  const totalFC = flashcards.length;
  const reviewedFC = Object.values(cp).reduce((acc, c) => acc + c.flashcardsReviewed.length, 0);

  const totalCorrect = Object.values(cp).reduce((acc, c) => acc + c.correctAnswers, 0);
  const totalAnswered = Object.values(cp).reduce((acc, c) => acc + c.totalAnswers, 0);

  const totalActs = activities.length;
  const doneActs = Object.values(cp).reduce(
    (acc, c) => acc + c.activitiesCompleted.length,
    0,
  );

  const recommended = courses[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="pill mb-3">لوحة الأسبوع</div>
          <h1 className="font-display text-4xl text-sand-50">رحلتك في {meta.title}</h1>
          <p className="mt-2 text-sand-100/60">
            تابع تقدّمك، استكمل الدورات، وانتقل للأسبوع التالي بجهوزية كاملة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card flex items-center gap-3 px-4 py-3">
            <Icons.Trophy size={22} className="text-gold-300" />
            <div>
              <div className="text-2xl font-bold text-sand-50">
                {unlocked.length}
                <span className="text-sm text-sand-100/50">
                  /{unlocked.length + 6}
                </span>
              </div>
              <div className="text-xs text-sand-100/50">إنجاز مفتوح</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI
          icon={<Icons.Book size={20} className="text-gold-300" />}
          label="تقدّم المنهج"
          value={`${overallPct}%`}
          sub={`${totalCompleted} / ${totalSections} قسم`}
        />
        <KPI
          icon={<Icons.Cards size={20} className="text-emerald-glow" />}
          label="البطاقات"
          value={`${reviewedFC} / ${totalFC}`}
          sub="بطاقة مراجعة"
        />
        <KPI
          icon={<Icons.Check size={20} className="text-rose-glow" />}
          label="إجابات صحيحة"
          value={`${totalCorrect}`}
          sub={`من ${totalAnswered} محاولة`}
        />
        <KPI
          icon={<Icons.Sprout size={20} className="text-cyan-400" />}
          label="الأنشطة"
          value={`${doneActs} / ${totalActs}`}
          sub="نشاط منجز"
        />
      </div>

      {/* Recommended */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 lg:col-span-2">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold-300/10 blur-3xl" />
          <div className="relative">
            <div className="pill mb-3">التوصية</div>
            <h2 className="font-display text-2xl text-sand-50">
              ابدأ بـ «{recommended.title}»
            </h2>
            <p className="mt-2 text-sand-100/60">{recommended.subtitle}</p>
            <p className="mt-4 line-clamp-3 text-sm text-sand-100/50">
              {recommended.summary}
            </p>
            <Link
              to={`/course/${recommended.slug}`}
              className="btn btn-primary mt-6"
              onClick={() => useStore.getState().markStarted(recommended.id)}
            >
              ابدأ الآن
              <Icons.ArrowLeft size={16} className="flip-x" />
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="pill">قبل الأسبوع التالي</div>
            <Icons.Rocket size={18} className="text-cyan-400" />
          </div>
          <h3 className="mt-3 font-display text-lg text-sand-50">قائمة الجاهزية</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {(synthesis.beforeNextWeek ?? []).map((item: string) => {
              const done = item.startsWith("✓");
              return (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      done ? "bg-emerald-glow/20 text-emerald-glow" : "bg-white/5 text-sand-100/40"
                    }`}
                  >
                    {done ? "✓" : "·"}
                  </span>
                  <span className={done ? "text-sand-100/40 line-through" : "text-sand-100/80"}>
                    {item.replace(/^✓\s*/, "")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Course grid */}
      <div className="mt-12">
        <h2 className="mb-4 font-display text-2xl text-sand-50">تقدّم الدورات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const progress = cp[c.id];
            const fc = flashcards.filter((f) => f.courseId === c.id).length;
            const act = activities.filter((a) => a.courseId === c.id).length;
            const pct = computeCourseProgressPercent(progress, c.sections.length, fc, act);
            return (
              <Link
                key={c.id}
                to={`/course/${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10"
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${c.scrollColor}20`, color: c.scrollColor }}
                >
                  <CourseIcon name={c.iconKey} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-medium text-sand-50">{c.title}</h3>
                    <span className="text-xs text-sand-100/50">{pct}%</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-sand-100/50">{c.subtitle}</div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: c.scrollColor }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-sand-100/60">{label}</div>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl text-sand-50">{value}</div>
      <div className="text-xs text-sand-100/50">{sub}</div>
    </div>
  );
}
