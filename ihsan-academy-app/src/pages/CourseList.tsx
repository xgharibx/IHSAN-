import { Link } from "react-router-dom";
import { useCourses, useFlashcards, useActivities, useWeekMeta } from "@/hooks/useWeekHooks";
import { useStore, computeCourseProgressPercent } from "@/store/useStore";
import { CourseIcon } from "@/components/Icons";

export default function CourseList() {
  const courses = useCourses();
  const flashcards = useFlashcards();
  const activities = useActivities();
  const meta = useWeekMeta();
  const cp = useStore((s) => s.courseProgress);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="pill mb-3">دورات {meta.title}</div>
        <h1 className="font-display text-4xl text-sand-50">جميع الدورات</h1>
        <p className="mt-2 max-w-2xl text-sand-100/60">
          اختر دورة لبدء الدراسة. تقدّمك محفوظ تلقائيًا.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const totalFC = flashcards.filter((f) => f.courseId === c.id).length;
          const totalAct = activities.filter((a) => a.courseId === c.id).length;
          const pct = computeCourseProgressPercent(cp[c.id], c.sections.length, totalFC, totalAct);
          return (
            <Link
              key={c.id}
              to={`/course/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:border-gold-300/30 hover:shadow-glow"
            >
              <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(400px 200px at top right, ${c.scrollColor}25, transparent 60%)` }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ background: `${c.scrollColor}20`, color: c.scrollColor }}
                >
                  <CourseIcon name={c.iconKey} size={24} />
                </div>
                <span className="text-xs text-sand-100/50">{c.duration}</span>
              </div>
              <h3 className="relative mt-4 font-display text-xl text-sand-50">{c.title}</h3>
              <p className="relative mt-1 line-clamp-2 text-sm text-sand-100/60">{c.subtitle}</p>
              <div className="relative mt-4 text-xs text-sand-100/50">
                {c.sections.length} أقسام · {totalFC} بطاقات · {totalAct} أنشطة
              </div>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: c.scrollColor }}
                />
              </div>
              <div className="relative mt-2 text-xs text-sand-100/60">{pct}% منجز</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
